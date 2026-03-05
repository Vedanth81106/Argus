package com.argus.orchestrator.dtos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CommitDto {
    private final String sha;
    private final String message;
    private final String author;
    private final String date;

    @JsonCreator
    @SuppressWarnings("unchecked")
    public CommitDto(
            @JsonProperty("sha") String sha,
            @JsonProperty("commit") Map<String, Object> commit
    ) {
        this.sha = sha;

        if (commit != null) {
            this.message = (String) commit.get("message");

            Map<String, Object> authorMap = (Map<String, Object>) commit.get("author");
            if (authorMap != null) {
                this.author = (String) authorMap.get("name");
                this.date = (String) authorMap.get("date");
            } else {
                this.author = "Unknown";
                this.date = null;
            }
        } else {
            this.message = "No message";
            this.author = "Unknown";
            this.date = null;
        }
    }
}