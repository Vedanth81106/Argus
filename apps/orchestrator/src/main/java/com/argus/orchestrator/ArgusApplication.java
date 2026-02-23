package com.argus.orchestrator;

import com.argus.orchestrator.services.GithubService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Map;

@SpringBootApplication
@EnableScheduling
public class ArgusApplication {

	public static void main(String[] args) {
		SpringApplication.run(ArgusApplication.class, args);
	}
}
