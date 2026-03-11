package com.argus.orchestrator.controllers;

import com.argus.orchestrator.services.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EmitterController {

    private final SseService sseService;

    @GetMapping("/reviews/{sha}")
    public SseEmitter streamReview(@PathVariable String sha) {

        SseEmitter emitter = new SseEmitter(300_000L);
        sseService.addEmitter(sha, emitter);

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connection Established"));
        } catch (IOException e) {
            return null;
        }

        emitter.onCompletion(() -> sseService.removeEmitter(sha));
        emitter.onTimeout(() -> sseService.removeEmitter(sha));

        return emitter;
    }
}
