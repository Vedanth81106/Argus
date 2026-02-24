package com.argus.orchestrator.repositories;

import com.argus.orchestrator.entities.AiReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiReviewRepository extends JpaRepository<AiReviewEntity, UUID> {
}
