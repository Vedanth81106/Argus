package com.argus.orchestrator.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

//this entity looks similar to the DTO but it is relevant due to the fact that we are storing the review in a db

@Entity
@Table(name = "reviews")
@Data
public class AiReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String repoId;
    private String commitSha;
    private int score;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String logicErrors;

    @Column(columnDefinition = "TEXT")
    private String performanceBottlenecks;

    @Column(columnDefinition = "TEXT")
    private String securityVulnerabilities;

}
