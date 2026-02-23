package com.argus.orchestrator.rabbitmq;

import com.argus.orchestrator.dtos.AiReview;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class RabbitMQResultConsumer {

    @RabbitListener(queues = "results-queue")
    public void recieveFeedback(AiReview result) {

        System.out.println("Received Review for: " + result.repoId() + " " + result.commitSha() + " " + result.aiFeedback());
    }
}
