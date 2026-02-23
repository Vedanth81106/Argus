package com.argus.orchestrator.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    static final String topicExchangeName = "orchestrator-exchange"; // like a soritng facility
    static final String queueName = "orchestrator-queue"; // like a mailbox
    static final String ROUTING_KEY = "repo.update.event"; // any message whose routing key starts with repo.update.event

    @Bean
    public Queue queue() {
        return new Queue(queueName, true); // durable = true meaning the queue will survive a rabbitmq server restart
    }

    @Bean
    public TopicExchange exchange(){ // Use TopicExchange explicitly
        return new TopicExchange(topicExchangeName);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange){// connects exchange to queue and selects which messages to send there
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter(){

        return new JacksonJsonMessageConverter();
    }

}
