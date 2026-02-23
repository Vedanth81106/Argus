package com.argus.orchestrator.dtos;

public record AiReview(
        String repoId,
        String commitSha,
        String aiFeedback
) {
}
