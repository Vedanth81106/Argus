package com.argus.orchestrator.services;

import com.argus.orchestrator.dtos.RepoDto;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import lombok.RequiredArgsConstructor;
import org.kohsuke.github.GHCommit;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MonitoredRepoService {


    private final MonitoredRepoRepository monitoredRepoRepository;
    private final RabbitTemplate rabbitTemplate;
    private final GithubService githubService;

    public MonitoredRepo addRepo(RepoDto dto) throws IOException {

        if(monitoredRepoRepository.findByOwnerAndRepositoryName(dto.getOwner(), dto.getRepoName()).isPresent()){
            throw new IllegalStateException("Repo already exists!");
        }

        MonitoredRepo repo = githubService.fetchRepo(dto.getOwner(), dto.getRepoName());
        MonitoredRepo savedRepo = monitoredRepoRepository.save(repo);
        checkRepoUpdate(repo); // so that it immediately sends repo to the job queue

        return monitoredRepoRepository.save(repo);
    }

    public void checkRepoUpdate(MonitoredRepo repo) throws IOException {

        GHCommit currentCommit = githubService.getLatestCommit(repo);
        String latestCommitSha = currentCommit.getSHA1();

        if(latestCommitSha != null && !latestCommitSha.equals(repo.getLastCommitSha())){ // latest SHA vs database ka SHA
            sendJob(repo, currentCommit);
        }

        updateRepo(repo, latestCommitSha);
    }

    @Scheduled(fixedRate = 10000)
    // @Scheduled(fixedRate = 45, timeUnit = TimeUnit.MINUTES)
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

        Map<String, Object> job = new HashMap<>();

        job.put("repoId", repo.getId());
        job.put("files", githubService.convertGHCommitToPatchData(commit));
        job.put("commitSha", commit.getSHA1());

        rabbitTemplate.convertAndSend("orchestrator-exchange", "repo.update.event", job);
        System.out.println("Job sent to RabbitMQ");

    }

    private void updateRepo(MonitoredRepo repo, String newSha) {

        repo.setLastPolledAt(LocalDateTime.now());

        if (newSha != null) repo.setLastCommitSha(newSha);
        else return;

        MonitoredRepo savedRepo = monitoredRepoRepository.save(repo);
    }
}