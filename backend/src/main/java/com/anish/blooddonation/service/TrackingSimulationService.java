package com.anish.blooddonation.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TrackingSimulationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Async
    public void startTracking(Long requestId, double donorLat, double donorLng, double hospLat, double hospLng) {
        int steps = 30; // 30 steps * 2 seconds = 60 seconds simulation
        long sleepInterval = 2000;

        for (int i = 0; i <= steps; i++) {
            try {
                // Interpolate coordinates
                double currentLat = donorLat + ((hospLat - donorLat) * i / steps);
                double currentLng = donorLng + ((hospLng - donorLng) * i / steps);

                // Calculate ETA in minutes (decreasing)
                int etaMinutes = Math.max(1, (steps - i) * 2 / 60);
                if (i == steps) etaMinutes = 0;

                Map<String, Object> payload = new HashMap<>();
                payload.put("type", "LOCATION_UPDATE");
                payload.put("latitude", currentLat);
                payload.put("longitude", currentLng);
                payload.put("hospLat", hospLat);
                payload.put("hospLng", hospLng);
                payload.put("etaMinutes", etaMinutes);
                payload.put("progress", (int) ((i / (double) steps) * 100));

                messagingTemplate.convertAndSend("/topic/tracking/" + requestId, (Object) payload);

                if (i < steps) {
                    Thread.sleep(sleepInterval);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}

