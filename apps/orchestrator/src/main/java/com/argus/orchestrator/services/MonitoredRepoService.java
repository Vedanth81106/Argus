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
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
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
            sendJob(repo, currentCommit, false);
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

    @Transactional
    public void sendJob(MonitoredRepo repo, GHCommit commit, boolean isReAudit) throws IOException {
        String commitSha = commit.getSHA1();

        // 1. Find existing or create new
        CodeReview review = codeReviewRepository.findFirstByCommitShaOrderByCreatedAtDesc(commitSha)
                .orElseGet(() -> {
                    CodeReview nr = new CodeReview();
                    nr.setCommitSha(commitSha);
                    nr.setMonitoredRepo(repo);
                    nr.setRepoId(repo.getId().toString());
                    return nr;
                });

        // 2. If it's NOT a re-audit and it's already "Done" (has a summary), skip it
        if (!isReAudit && review.getId() != null && !review.getSummary().equals("AI is currently analyzing this commit...")) {
            System.out.println("Skipping: Review already exists for " + commitSha);
            return;
        }

        // 3. Set/Reset to Pending state
        review.setSummary("AI is currently analyzing this commit...");
        review.setScore(0);
        review.setLogicErrors(null);
        review.setPerformanceBottlenecks(null);
        review.setSecurityVulnerabilities(null);
        review.setCreatedAt(LocalDateTime.now());

        // 4. Save (Hibernate handles INSERT vs UPDATE automatically based on ID)
        codeReviewRepository.saveAndFlush(review);

        // 5. Dispatch
        dispatchToRabbit(repo, commit, commitSha);
    }

    // Keep this reAudit simple
    @Transactional
    public ResponseEntity<CodeReview> reAudit(String sha) throws IOException {
        CodeReview review = codeReviewRepository.findFirstByCommitShaOrderByCreatedAtDesc(sha)
                .orElseThrow(() -> new NoSuchElementException("Code review does not exist"));

        triggerManualAudit(UUID.fromString(review.getRepoId()), sha, true);
        return ResponseEntity.ok(review);
    }

    private void dispatchToRabbit(MonitoredRepo repo, GHCommit commit, String commitSha) throws IOException {
        Map<String, Object> job = new HashMap<>();
        job.put("repoId", repo.getId());
        job.put("files", githubService.convertGHCommitToPatchData(commit));
        job.put("commitSha", commitSha);

        rabbitTemplate.convertAndSend("orchestrator-exchange", "repo.update.event", job);
        System.out.println("Job sent to RabbitMQ");
    }

    @Transactional
    public void triggerManualAudit(UUID repoId, String commitSha, boolean isReudit) throws IOException {
        MonitoredRepo repo = monitoredRepoRepository.findById(repoId)
                .orElseThrow(() -> new NoSuchElementException("Repo not found"));

        GHRepository repository = githubService.getGHRepository(repo);
        GHCommit commit = repository.getCommit(commitSha);

        sendJob(repo, commit,isReudit);
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