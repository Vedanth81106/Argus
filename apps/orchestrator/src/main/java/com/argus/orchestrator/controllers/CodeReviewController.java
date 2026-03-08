package com.argus.orchestrator.controllers;

import com.argus.orchestrator.entities.CodeReview;
import com.argus.orchestrator.repositories.CodeReviewRepository;
import com.argus.orchestrator.services.GithubService;
import com.argus.orchestrator.services.MonitoredRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewRepository codeReviewRepository;
    private final MonitoredRepoService monitoredRepoService;

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
        return codeReviewRepository.findFirstByCommitShaOrderByCreatedAtDesc(sha)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{sha}/re-audit")
    public ResponseEntity<CodeReview> reAudit(@PathVariable String sha) throws IOException {

        return monitoredRepoService.reAudit(sha);
    }

}
