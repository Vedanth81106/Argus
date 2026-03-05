package com.argus.orchestrator.controllers;

import com.argus.orchestrator.dtos.CommitDto;
import com.argus.orchestrator.dtos.GitHubUserResponse;
import com.argus.orchestrator.dtos.RepoDto;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import com.argus.orchestrator.services.GithubService;
import com.argus.orchestrator.services.MonitoredRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MonitoredRepoController {

    private final MonitoredRepoService monitoredRepoService;
    private final GithubService githubService;
    private final MonitoredRepoRepository monitoredRepoRepository;

    @PostMapping("/repos/add")
    @ResponseStatus(HttpStatus.CREATED)
    public MonitoredRepo addRepo(@RequestBody RepoDto dto) throws IOException {

        return monitoredRepoService.addRepo(dto);
    }

    @GetMapping("/users/{username}")
    public List<GitHubUserResponse>  getUsersContainingString(@PathVariable String username) throws IOException {
        return githubService.getAllUsersContainingString(username);
    }

    @GetMapping("/users/{username}/repos")
    public List<String>  getAllReposFromUser(@PathVariable String username) throws IOException {
        return githubService.getAllReposFromUser(username);
    }

    @GetMapping("/repos")
    public List<MonitoredRepo> getAllRepos() {
        return monitoredRepoService.findAll();
    }

    @PostMapping("/repos/{id}/audit/{sha}")
    public ResponseEntity<String> auditCommit(@PathVariable UUID id, @PathVariable String sha) throws IOException {
        monitoredRepoService.triggerManualAudit(id, sha);
        return ResponseEntity.ok("Audit job queued for commit: " + sha);
    }

    @DeleteMapping("/repos/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRepo(@RequestBody RepoDto dto) throws IOException {
        monitoredRepoService.deleteRepo(dto);
    }

    @GetMapping(value = "repos/{id}/commits/stream", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<CommitDto> getStreamedCommits(@PathVariable UUID id) throws IOException {
        return githubService.streamCommits(id);
    }
}
