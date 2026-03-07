package com.argus.orchestrator.services;

import com.argus.orchestrator.dtos.AiReviewDto;
import com.argus.orchestrator.entities.CodeReview;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.CodeReviewRepository;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class RabbitMQResultConsumer {

    @Autowired
    private CodeReviewRepository codeReviewRepository;
    @Autowired
    private MonitoredRepoRepository monitoredRepoRepository;
    @Autowired
    private SseService sseService;

    @RabbitListener(queues = "results-queue")
    public void receiveFeedback(AiReviewDto review) {

        System.out.println("RECEIVED FROM RABBIT: " + review);

        if (review.repoId() == null) {
            System.err.println("STOP: repoId is null! Check Python sender logic.");
            return;
        }

        System.out.println("Received structured review for: " + review.commitSha());
        Optional<MonitoredRepo> repoOpt = monitoredRepoRepository.findById(UUID.fromString(review.repoId()));

        if (repoOpt.isEmpty()) {
            System.out.println("⚠️ Received review for Repo ID " + review.repoId() + ", but it was deleted. Skipping save.");
            sseService.sendReview(review.commitSha(), null);
            return;
        }

        MonitoredRepo repo = repoOpt.get();

        CodeReview entity = codeReviewRepository.findFirstByCommitShaOrderByCreatedAtDesc(review.commitSha())
                .orElseGet(() -> {
                    System.out.println("No pending review found, creating fresh entity.");
                    CodeReview newReview = new CodeReview();
                    newReview.setCommitSha(review.commitSha());
                    return newReview;
                });

        entity.setMonitoredRepo(repo);
        entity.setRepoId(review.repoId());
        entity.setScore(review.score());
        entity.setSummary(review.summary());
        entity.setLogicErrors(review.logicErrors());
        entity.setPerformanceBottlenecks(review.performanceBottlenecks());
        entity.setSecurityVulnerabilities(review.securityVulnerabilities());

        codeReviewRepository.save(entity);
        System.out.println("Review saved to database with score: " + review.score());

        sseService.sendReview(review.commitSha(),  review);
    }
}
