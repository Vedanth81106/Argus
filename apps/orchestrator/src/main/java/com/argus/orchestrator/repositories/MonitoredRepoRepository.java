package com.argus.orchestrator.repositories;

import com.argus.orchestrator.entities.MonitoredRepo;
import org.springframework.data.jpa.repository.JpaRepository;
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
}