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
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import okhttp3.Cache;
import okhttp3.OkHttpClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

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

    public List<String> getAllUsersContainingString(String username) throws IOException {

        String url = "https://api.github.com/search/users?q=" + username;

        HttpClient client = HttpClient.newBuilder().build();

        HttpRequest request =  HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + githubToken)
                .header("User-Agent", "Argus-App")
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET()
                .build();

        try{

            List<String> usernames = new ArrayList<>();
            HttpResponse response = client.send(request, HttpResponse.BodyHandlers.ofString());

            String responseBody = response.body().toString();
            ObjectMapper mapper = new ObjectMapper();

            JsonNode rootNode = mapper.readTree(responseBody);

            if(rootNode.get("items") != null && rootNode.get("items").isArray()){
                for(JsonNode node : rootNode.get("items")){
                    usernames.add(node.get("login").asText());
                }
            }
            return usernames;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getAllReposFromUser(String username) throws IOException {

        String url = "https://api.github.com/users/" + username +"/repos";

        HttpClient client = HttpClient.newBuilder().build();

        HttpRequest request =  HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + githubToken)
                .header("User-Agent", "Argus-App")
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET()
                .build();

        try{

            List<String> repos = new ArrayList<>();
            HttpResponse response = client.send(request, HttpResponse.BodyHandlers.ofString());

            String responseBody = response.body().toString();
            ObjectMapper mapper = new ObjectMapper();

            JsonNode rootNode = mapper.readTree(responseBody);

            if(rootNode.isArray()){
                for(JsonNode node : rootNode){
                    repos.add(node.get("name").asText());
                }
            }

            return repos;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
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
            String patch = file.getPatch();

            System.out.println("📦 Found file: " + fileName + " (Patch size: " + (patch != null ? patch.length() : "NULL") + ")");

            patchMap.put("file", fileName);
            patchMap.put("patch", (patch != null && !patch.isEmpty()) ? patch : "New file added: Full content review required.");

            patchData.add(patchMap);
        }

        return patchData;
    }
}
