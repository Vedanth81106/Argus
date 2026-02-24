package com.argus.orchestrator.dtos;

public record AiReviewDto(
        int score,
        String summary,
        String repoId,
        String commitSha,
        String logicErrors,
        String performanceBottlenecks,
        String securityVulnerabilities
) {
}
