package com.argus.orchestrator.services;

import com.argus.orchestrator.dtos.RepoDto;
import com.argus.orchestrator.entities.CodeReview;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.CodeReviewRepository;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.kohsuke.github.GHCommit;
import org.kohsuke.github.GHRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MonitoredRepoService {


    private final MonitoredRepoRepository monitoredRepoRepository;
    private final RabbitTemplate rabbitTemplate;
    private final GithubService githubService;
    private final WebClient.Builder webClientBuilder;
    private final CodeReviewRepository codeReviewRepository;

    public MonitoredRepo addRepo(RepoDto dto) throws IOException {

        if(monitoredRepoRepository.findByOwnerAndRepositoryName(dto.getOwner(), dto.getRepoName()).isPresent()){
            throw new IllegalStateException("Repo already exists!");
        }

        MonitoredRepo repo = githubService.fetchRepo(dto.getOwner(), dto.getRepoName());
        // saveAndFlush() forces Hibernate to send the data to the database immediately and wait for the response
        MonitoredRepo savedRepo = monitoredRepoRepository.saveAndFlush(repo);
        checkRepoUpdate(savedRepo); // so that it immediately sends repo to the job queue
        return savedRepo;
    }

    public void checkRepoUpdate(MonitoredRepo repo) throws IOException {

        // ensure we have the ID if it was just saved
        if (repo.getId() == null) {
            repo = monitoredRepoRepository.saveAndFlush(repo);
        }

        GHCommit currentCommit = githubService.getLatestCommit(repo);
        String latestCommitSha = currentCommit.getSHA1();

        if(latestCommitSha != null && !latestCommitSha.equals(repo.getLastCommitSha())){ // latest SHA vs database ka SHA
            sendJob(repo, currentCommit);
        }

        updateRepo(repo, latestCommitSha);
    }

    // @Scheduled(fixedRate = 10000)
    @Scheduled(fixedRate = 30, timeUnit = TimeUnit.MINUTES)
    public void pollRepos() {
        LocalDateTime thirtyMinsAgo = LocalDateTime.now().minusMinutes(1);

        List<MonitoredRepo> staleRepos = monitoredRepoRepository.findByLastPolledAtBeforeOrLastPolledAtIsNull(thirtyMinsAgo);

        for (MonitoredRepo repo : staleRepos) {
            System.out.println("Polling for repo " + repo.getOwner() + "/" + repo.getRepositoryName());
            try {
                checkRepoUpdate(repo);
            } catch (Exception e) {
                System.err.println("Error polling repo: " + repo.getRepositoryName() + " - " + e.getMessage());
            }
        }
    }

    public void sendJob(MonitoredRepo repo, GHCommit commit) throws IOException {

        String commitSha = commit.getSHA1();
        if(codeReviewRepository.existsByCommitSha(commitSha)){
            System.out.println("Skipping review: Review for " + commitSha + "already exists!");
            return;
        }

        CodeReview pendingReview = new CodeReview();
        pendingReview.setCommitSha(commitSha);
        pendingReview.setRepoId(repo.getId().toString());
        pendingReview.setCreatedAt(LocalDateTime.now());
        pendingReview.setMonitoredRepo(repo);
        pendingReview.setSummary("AI is currently analyzing this commit...");
        pendingReview.setScore(0);

        codeReviewRepository.saveAndFlush(pendingReview);

        Map<String, Object> job = new HashMap<>();

        job.put("repoId", repo.getId());
        job.put("files", githubService.convertGHCommitToPatchData(commit));
        job.put("commitSha", commit.getSHA1());

        rabbitTemplate.convertAndSend("orchestrator-exchange", "repo.update.event", job);
        System.out.println("Job sent to RabbitMQ");

    }

    public void triggerManualAudit(UUID repoId, String commitSha) throws IOException {
        MonitoredRepo repo = monitoredRepoRepository.findById(repoId)
                .orElseThrow(() -> new NoSuchElementException("Repo not found"));

        GHRepository repository = githubService.getGHRepository(repo);
        GHCommit commit = repository.getCommit(commitSha);

        sendJob(repo, commit);
    }

    private void updateRepo(MonitoredRepo repo, String newSha) {

        repo.setLastPolledAt(LocalDateTime.now());

        if (newSha != null) repo.setLastCommitSha(newSha);
        else return;

        MonitoredRepo savedRepo = monitoredRepoRepository.save(repo);
    }

    public List<MonitoredRepo> findAll() {
        return monitoredRepoRepository.findAll();
    }

    @Transactional
    public void deleteRepo(RepoDto dto){
        MonitoredRepo existingRepo = monitoredRepoRepository.findByOwnerAndRepositoryName(dto.getOwner(), dto.getRepoName())
                .orElseThrow(() -> new NoSuchElementException("Repo not found!"));

        UUID repoId = existingRepo.getId();

        monitoredRepoRepository.delete(existingRepo);

        // trigger ai worker cleanup
        try {
            webClientBuilder.build()
                    .delete()
                    .uri("http://localhost:8000/delete/{repo_id}", repoId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

        } catch (Exception e) {
            System.err.println("AI Worker cleanup failed, but SQL delete succeeded: " + e.getMessage());
        }
    }

}