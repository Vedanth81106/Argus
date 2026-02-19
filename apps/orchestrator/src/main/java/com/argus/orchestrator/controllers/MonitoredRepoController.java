package com.argus.orchestrator.controllers;

import com.argus.orchestrator.dtos.RepoDTO;
import com.argus.orchestrator.entities.MonitoredRepo;
import com.argus.orchestrator.repositories.MonitoredRepoRepository;
import com.argus.orchestrator.services.MonitoredRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class MonitoredRepoController {

    private final MonitoredRepoService monitoredRepoService;

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public MonitoredRepo addRepo(@RequestBody RepoDTO dto){

        return monitoredRepoService.addRepo(dto);
    }

}
