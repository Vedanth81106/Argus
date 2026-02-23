package com.argus.orchestrator.dtos;

import java.util.UUID;

public record JobRequestDto(
        UUID repoId,
        String repositoryUrl,
        String commitSha,
        String patch
) {}
