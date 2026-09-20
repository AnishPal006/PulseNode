package com.anish.blooddonation.service;

import com.anish.blooddonation.model.BloodRequest;
import com.anish.blooddonation.repository.BloodRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RedisMessageSubscriber implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisMessageSubscriber.class);

    @Autowired
    private BloodRequestRepository requestRepository;

    @Autowired
    private MatchingService matchingService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String requestIdStr = new String(message.getBody());
        log.info("#### -> Consumed Redis message -> " + requestIdStr);
        
        try {
            Long requestId = Long.parseLong(requestIdStr.replace("\"", "")); // clean serialization quotes
            Optional<BloodRequest> requestOpt = requestRepository.findById(requestId);
            if (requestOpt.isPresent()) {
                matchingService.processNewRequest(requestOpt.get());
                log.info("#### -> Matching process completed via Redis Pub/Sub for request -> " + requestId);
            } else {
                log.warn("#### -> Blood request not found for ID -> " + requestId);
            }
        } catch (NumberFormatException e) {
            log.error("Failed to parse Request ID from Redis message", e);
        }
    }
}
