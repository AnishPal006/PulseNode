package com.anish.blooddonation.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
public class RedisMessagePublisher {
    
    private static final Logger log = LoggerFactory.getLogger(RedisMessagePublisher.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ChannelTopic topic;

    public void publishBloodRequestEvent(Long requestId) {
        log.info("#### -> Publishing Redis message -> " + requestId);
        redisTemplate.convertAndSend(topic.getTopic(), requestId.toString());
    }
}
