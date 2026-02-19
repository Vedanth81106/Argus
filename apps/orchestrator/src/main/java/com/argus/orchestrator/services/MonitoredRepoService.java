package com.argus.orchestrator.services;

import com.argus.orchestrator.dtos.RepoDTO;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MonitoredRepoService {

    private final WebClient webclient = WebClient.create("https://api.github.com");
    private final MonitoredRepoRepository monitoredRepoRepository;

    public MonitoredRepo fetchRepoDetails(String owner, String repo) {
        // .block() waits for the response and returns the actual MonitoredRepo object
        return webclient.get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Repo not found on GitHub!")))
                .bodyToMono(JsonNode.class)
                .map(json -> MonitoredRepo.builder()
                        .owner(owner)
                        .repositoryName(repo)
                        .repositoryUrl(json.get("html_url").asText())
                        .avatarUrl(json.get("owner").get("avatar_url").asText())
                        .lastPolledAt(LocalDateTime.now())
                        .createTime(LocalDateTime.parse(json.get("created_at").asText(), java.time.format.DateTimeFormatter.ISO_DATE_TIME))
                        .build())
                .block();
    }

    public MonitoredRepo addRepo(RepoDTO dto){

        if(monitoredRepoRepository.findByOwnerAndRepositoryName(dto.getOwner(), dto.getRepoName()).isPresent()){
            throw new IllegalStateException("Repo already exists!");
        }

        MonitoredRepo repo = fetchRepoDetails(dto.getOwner(), dto.getRepoName());

        return monitoredRepoRepository.save(repo);
    }

    public void checkRepoUpdate(MonitoredRepo repo) {
        webclient.get()
                .uri("/repos/{owner}/{repo}/commits", repo.getOwner(), repo.getRepositoryName())
                .headers(httpHeaders -> {
                    if (repo.getLastEtag() != null) {
                        httpHeaders.setIfNoneMatch(repo.getLastEtag());
                    }
                })
                .exchangeToMono(response -> {
                    // Scenario: 304 Not Modified
                    if (response.statusCode().equals(HttpStatus.NOT_MODIFIED)) {
                        updateRepo(repo, null, null);
                        return Mono.empty();
                    }

                    // Scenario: 200 OK
                    String newEtag = response.headers().asHttpHeaders().getETag();

                    return response.bodyToMono(JsonNode.class)
                            .map(json -> {
                                if (json.isArray() && !json.isEmpty()) {
                                    String newSha = json.get(0).get("sha").asText();
                                    updateRepo(repo, newSha, newEtag);
                                    System.out.println("New commit found: " + newSha);
                                } else {
                                    updateRepo(repo, null, null);
                                }
                                return Mono.empty();
                            });
                })
                .block(); // wait for the check and update to finish
    }

    @Scheduled(fixedRate = 60000)
    public void pollRepos() {
        LocalDateTime thirtyMinsAgo = LocalDateTime.now().minusMinutes(30);

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

    private void updateRepo(MonitoredRepo repo, String newSha, String newEtag) {
        if (newSha != null) repo.setLastCommitSha(newSha);
        if (newEtag != null) repo.setLastEtag(newEtag);

        repo.setLastPolledAt(LocalDateTime.now());

        monitoredRepoRepository.save(repo);
    }
}