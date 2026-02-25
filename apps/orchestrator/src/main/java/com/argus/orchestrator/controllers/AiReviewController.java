package com.argus.orchestrator.controllers;

import com.argus.orchestrator.entities.AiReviewEntity;
import com.argus.orchestrator.repositories.AiReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiReviewController {

    private final AiReviewRepository aiReviewRepository;

    @GetMapping
    public List<AiReviewEntity> getAll() {
        return aiReviewRepository.findAll();
    }

    @GetMapping("/repo/{repoId}")
    public List<AiReviewEntity> getByRepo(@PathVariable String repoId) {
        return aiReviewRepository.findByRepoIdOrderByCreatedAtDesc(repoId);
    }
}
