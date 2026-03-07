package com.argus.orchestrator.entities;

import com.argus.orchestrator.enums.PollStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "repos")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonitoredRepo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String repositoryUrl;

    @Column( nullable = false)
    private String avatarUrl;

    @Column
    private LocalDateTime createTime;

    @Column(nullable = false)
    private String repositoryName;

    @Column(nullable = false)
    private String owner;

    @Column
    private String branch;

    @Enumerated(EnumType.STRING)
    @Column
    private PollStatus status;

    //nullable = true(by default) cus new repo will not have lastEtag or lastCommitSha
    //Etag is the header sent by github (300 NOT MODIFIED vs 200 OK)
    @Column()
    private String lastEtag;

    // Secure Hash Algo, unique code for every single commit
    @Column()
    private String lastCommitSha;

    @Column(nullable = false)
    private LocalDateTime lastPolledAt;

    @JsonManagedReference
    @OneToMany(mappedBy = "monitoredRepo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CodeReview> reviews = new ArrayList<>();
}