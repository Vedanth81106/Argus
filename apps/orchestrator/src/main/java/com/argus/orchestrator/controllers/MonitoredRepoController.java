package com.argus.orchestrator.controllers;

import com.argus.orchestrator.dtos.GitHubUserResponse;
import com.argus.orchestrator.dtos.RepoDto;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.services.GithubService;
import com.argus.orchestrator.services.MonitoredRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MonitoredRepoController {

    private final MonitoredRepoService monitoredRepoService;
    private final GithubService githubService;

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

    @DeleteMapping("/repos/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRepo(@RequestBody RepoDto dto) throws IOException {
        monitoredRepoService.deleteRepo(dto);
    }
}
