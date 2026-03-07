package com.argus.orchestrator.controllers;

import com.argus.orchestrator.entities.CodeReview;
import com.argus.orchestrator.repositories.CodeReviewRepository;
import com.argus.orchestrator.services.GithubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiReviewController {

    private final CodeReviewRepository codeReviewRepository;
    private final GithubService githubService;

    @GetMapping
    public List<CodeReview> getAll() {
        return codeReviewRepository.findAll();
    }

    @GetMapping("/repo/{repoId}")
    public List<CodeReview> getByRepo(@PathVariable String repoId) {
        return codeReviewRepository.findByRepoIdOrderByCreatedAtDesc(repoId);
    }

    @GetMapping("/{sha}")
    public ResponseEntity<CodeReview> getReviewBySha(@PathVariable String sha) {
        return codeReviewRepository.findByCommitSha(sha)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
