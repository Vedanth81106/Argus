package com.argus.orchestrator.services;

import com.argus.orchestrator.entities.MonitoredRepo;
import jakarta.annotation.PostConstruct;
import org.kohsuke.github.*;
import org.kohsuke.github.extras.okhttp3.OkHttpGitHubConnector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import okhttp3.Cache;
import okhttp3.OkHttpClient;

@Service
public class GithubService {

    @Value("${github.token}")
    private String githubToken;

    private GitHub github;

    @PostConstruct // runs once the service starts
    public void init() throws IOException {

        //Setup a disk cache so ETags survive a restart
        File cacheDir = new File("github-cache");
        Cache cache  = new Cache(cacheDir, 10 * 1024 * 1024); // 10 MB space for cache

        OkHttpClient client  = new OkHttpClient.Builder().cache(cache).build();

        this.github = new GitHubBuilder()
                .withConnector(new OkHttpGitHubConnector(client))
                .withOAuthToken(githubToken)
                .build();
    }

    public MonitoredRepo fetchRepo(String owner, String repoName){

        try{

            GHRepository githubRepo = github.getRepository(owner + "/" + repoName);
            return MonitoredRepo.builder()
                    .owner(owner)
                    .repositoryName(repoName)
                    .repositoryUrl(githubRepo.getHtmlUrl().toString())
                    .avatarUrl(githubRepo.getOwner().getAvatarUrl())
                    .lastPolledAt(LocalDateTime.now())
                    .createTime(githubRepo.getCreatedAt().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDateTime())
                    .branch(githubRepo.getDefaultBranch())
                    .build();
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "GitHub Repo not found!");
        }
    }

    public GHCommit getLatestCommit(MonitoredRepo monitoredRepo) {
        try {

            String fullName = monitoredRepo.getOwner() + "/" + monitoredRepo.getRepositoryName();
            return github.getRepository(fullName).getCommit(monitoredRepo.getBranch());

        } catch (IOException e) {
            System.err.println("GitHub API Error: " + e.getMessage());
            return null;
        }
    }

    public List<HashMap<String, String>> convertGHCommitToPatchData(GHCommit commit) throws IOException {

        List<HashMap<String, String>> patchData = new ArrayList<>();

        for(GHCommit.File file : commit.listFiles()){

            HashMap<String, String> patchMap = new HashMap<>();

            String fileName = file.getFileName();
            patchMap.put("file",fileName);

            String patch = file.getPatch();
            if(patch == null || patch.isEmpty()) continue;
            patchMap.put("patch",patch);

            patchData.add(patchMap);
        }

        return patchData;
    }
}
