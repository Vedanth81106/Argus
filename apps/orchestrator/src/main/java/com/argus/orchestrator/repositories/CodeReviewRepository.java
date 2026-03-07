package com.argus.orchestrator.repositories;

import com.argus.orchestrator.entities.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodeReviewRepository extends JpaRepository<CodeReview, UUID> {
    List<CodeReview> findByRepoIdOrderByCreatedAtDesc(String repoId);
    Optional<CodeReview> findByCommitSha(String commitSha);
    boolean existsByCommitSha(String commitSha);
}
