package com.argus.orchestrator.dtos;

public record AiReview(
        String filePath,
        int[] lineNumbers,
        String description,
        String suggestedFix,
        String severity,
        int rating
) {
}
