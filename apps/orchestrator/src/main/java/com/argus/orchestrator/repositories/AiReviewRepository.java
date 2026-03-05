package com.argus.orchestrator.repositories;

import com.argus.orchestrator.entities.AiReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiReviewRepository extends JpaRepository<AiReviewEntity, UUID> {
    List<AiReviewEntity> findByRepoIdOrderByCreatedAtDesc(String repoId);
    Optional<AiReviewEntity> findByCommitSha(String commitSha);
}
