package com.argus.orchestrator.rabbitmq;

import com.argus.orchestrator.dtos.AiReviewDto;
import com.argus.orchestrator.entities.AiReviewEntity;
import com.argus.orchestrator.repositories.AiReviewRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RabbitMQResultConsumer {

    @Autowired
    private AiReviewRepository aiReviewRepository;

    @RabbitListener(queues = "results-queue")
    public void recieveFeedback(AiReviewDto review) {

        System.out.println("Received structured review for: " + review.commitSha());

        // Map the Record to the Entity
        AiReviewEntity entity = new AiReviewEntity();
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
    }
}
