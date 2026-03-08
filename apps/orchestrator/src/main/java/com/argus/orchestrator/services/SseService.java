package com.argus.orchestrator.services;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void addEmitter(String sha, SseEmitter emitter) {
        emitters.put(sha, emitter);
    }

    public void removeEmitter(String sha) {
        emitters.remove(sha);
    }

    public void sendReview(String sha, Object review) {
        SseEmitter emitter = emitters.get(sha);
        if(emitter != null) {
            try{
                emitter.send(SseEmitter.event()
                        .name("review-result")
                        .data(review));
                emitter.complete();
            }catch(IOException e){
                emitter.completeWithError(e);
            }
            finally{
                emitters.remove(sha);
            }
        }
    }
}
