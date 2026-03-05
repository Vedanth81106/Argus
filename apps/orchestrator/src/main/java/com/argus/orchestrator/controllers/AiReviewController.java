package com.argus.orchestrator.controllers;

import com.argus.orchestrator.dtos.CommitDto;
import com.argus.orchestrator.entities.AiReviewEntity;
import com.argus.orchestrator.repositories.AiReviewRepository;
import com.argus.orchestrator.services.GithubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiReviewController {

    private final AiReviewRepository aiReviewRepository;
    private final GithubService githubService;

    @GetMapping
    public List<AiReviewEntity> getAll() {
        return aiReviewRepository.findAll();
    }

    @GetMapping("/repo/{repoId}")
    public List<AiReviewEntity> getByRepo(@PathVariable String repoId) {
        return aiReviewRepository.findByRepoIdOrderByCreatedAtDesc(repoId);
    }

    @GetMapping("/{sha}")
    public ResponseEntity<AiReviewEntity> getReviewBySha(@PathVariable String sha) {
        return aiReviewRepository.findByCommitSha(sha)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
