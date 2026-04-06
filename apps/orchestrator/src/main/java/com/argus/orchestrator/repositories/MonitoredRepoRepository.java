package com.argus.orchestrator.repositories;

import com.argus.orchestrator.entities.MonitoredRepo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonitoredRepoRepository extends JpaRepository<MonitoredRepo, UUID> {

    // returns a standard List - the app will wait for the DB to finish fetching before moving on
    List<MonitoredRepo> findByLastPolledAtBeforeOrLastPolledAtIsNull(LocalDateTime threshold);
    Optional<MonitoredRepo> findByOwnerAndRepositoryName(String owner, String repoName);
    @Modifying
    @Query("UPDATE CodeReview c SET c.summary = :summary, c.score = :score, c.logicErrors = null, c.performanceBottlenecks = null, c.securityVulnerabilities = null, c.createdAt = :createdAt WHERE c.commitSha = :sha")
    void resetReview(@Param("sha") String sha, @Param("summary") String summary, @Param("score") int score, @Param("createdAt") LocalDateTime createdAt);
}