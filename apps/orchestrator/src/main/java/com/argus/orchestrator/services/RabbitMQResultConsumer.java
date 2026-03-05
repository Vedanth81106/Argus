package com.argus.orchestrator.services;

import com.argus.orchestrator.dtos.AiReviewDto;
import com.argus.orchestrator.entities.AiReviewEntity;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.AiReviewRepository;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RabbitMQResultConsumer {

    @Autowired
    private AiReviewRepository aiReviewRepository;
    @Autowired
    private MonitoredRepoRepository monitoredRepoRepository;
    @Autowired
    private SseService sseService;

    @RabbitListener(queues = "results-queue")
    public void receiveFeedback(AiReviewDto review) {

        System.out.println("RECEIVED FROM RABBIT: " + review);

        // 2. Defensive check
        if (review.repoId() == null) {
            System.err.println("STOP: repoId is null! Check Python sender logic.");
            return;
        }

        System.out.println("Received structured review for: " + review.commitSha());

        MonitoredRepo repo = monitoredRepoRepository.findById(UUID.fromString(review.repoId()))
                .orElseThrow(() -> new IllegalStateException("Repo not found!"));

        // Map the Record to the Entity
        AiReviewEntity entity = new AiReviewEntity();
        entity.setMonitoredRepo(repo);
        entity.setRepoId(review.repoId());
        entity.setCommitSha(review.commitSha());
        entity.setScore(review.score());
        entity.setSummary(review.summary());
        entity.setLogicErrors(review.logicErrors());
        entity.setPerformanceBottlenecks(review.performanceBottlenecks());
        entity.setSecurityVulnerabilities(review.securityVulnerabilities());
        entity.setCreatedAt(LocalDateTime.now());

        aiReviewRepository.save(entity);
        System.out.println("Review saved to database with score: " + review.score());

        sseService.sendReview(review.commitSha(),  review);
    }
}
