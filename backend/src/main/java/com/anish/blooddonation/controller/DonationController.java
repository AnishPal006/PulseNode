package com.anish.blooddonation.controller;

import com.anish.blooddonation.model.BloodRequest;
import com.anish.blooddonation.model.Donor;
import com.anish.blooddonation.model.Requester;
import com.anish.blooddonation.repository.BloodRequestRepository;
import com.anish.blooddonation.repository.DonorRepository;
import com.anish.blooddonation.repository.RequesterRepository;
import com.anish.blooddonation.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.anish.blooddonation.service.RedisMessagePublisher;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.Optional;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows your frontend to talk to the backend
public class DonationController {

    private final Counter bloodRequestCounter;

    public DonationController(MeterRegistry registry) {
        this.bloodRequestCounter = registry.counter("emergency_blood_requests_total");
    }

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private BloodRequestRepository requestRepository;

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private RedisMessagePublisher redisMessagePublisher;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Autowired
    private com.anish.blooddonation.service.TrackingSimulationService trackingSimulationService;

    @Autowired
    private RequesterRepository requesterRepository;

    // BD-01a: Register Donor[cite: 3]
    @PostMapping("/donors")
    @CacheEvict(value = "adminAnalytics", allEntries = true)
    public ResponseEntity<?> registerDonor(@RequestBody Donor donor) {

        try {
            // Set a dummy password for Google OAuth users to satisfy DB constraints
            if (donor.getPassword() == null || donor.getPassword().isEmpty()) {
                donor.setPassword("google_oauth_user_" + java.util.UUID.randomUUID().toString().substring(0, 8));
            }
            
            // Saves the donor along with their newly mapped password
            Donor newDonor = donorRepository.save(donor);
            return ResponseEntity.ok(newDonor);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error saving donor: " + e.getMessage());
            // Returns 409 Conflict if the email already exists in the database
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // BD-01b: Get donors
    @GetMapping("/donors")
    public ResponseEntity<List<Donor>> getDonors(@RequestParam(required = false) String verification_status) {
        List<Donor> allDonors = donorRepository.findAll();
        if (verification_status != null && !verification_status.isEmpty()) {
            List<Donor> pending = allDonors.stream()
                    .filter(d -> d.getVerificationStatus().equals(verification_status))
                    .toList();
            return ResponseEntity.ok(pending);
        }
        return ResponseEntity.ok(allDonors);
    }

    @GetMapping("/requesters")
    public ResponseEntity<List<Requester>> getRequesters() {
        return ResponseEntity.ok(requesterRepository.findAll());
    }

    // BD-02: Submit Blood Request[cite: 3]
    @PostMapping("/requests")
    @CacheEvict(value = {"adminAnalytics", "hospitalAnalytics"}, allEntries = true)
    public ResponseEntity<BloodRequest> createRequest(@RequestBody BloodRequest request) {
        bloodRequestCounter.increment();
        BloodRequest savedRequest = requestRepository.save(request);

        // Trigger the asynchronous matching and notification engine
        redisMessagePublisher.publishBloodRequestEvent(savedRequest.getRequestId());

        return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
    }

    @PostMapping("/requests/{requestId}/cancel")
    public ResponseEntity<BloodRequest> cancelRequest(@PathVariable Long requestId) {
        Optional<BloodRequest> optionalRequest = requestRepository.findById(requestId);
        if (optionalRequest.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        BloodRequest request = optionalRequest.get();
        request.setStatus("cancelled");
        requestRepository.save(request);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/requests/{requestId}/responses")
    public ResponseEntity<BloodRequest> respondToRequest(
            @PathVariable Long requestId,
            @RequestBody java.util.Map<String, String> payload) {

        String answer = payload.get("answer"); // "accept" or "decline"
        String donorIdString = payload.get("donorId");

        Optional<BloodRequest> optionalRequest = requestRepository.findById(requestId);
        if (optionalRequest.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 not found
        }

        BloodRequest request = optionalRequest.get();

        if ("accept".equalsIgnoreCase(answer)) {
            // Update the request status
            request.setStatus("matched");
            requestRepository.save(request);

            // 1. Look up the real donor in the database to get their name and coordinates
            String realDonorName = "A Donor";
            Double donorLat = null;
            Double donorLng = null;
            
            if (donorIdString != null) {
                try {
                    Long donorId = Long.parseLong(donorIdString);
                    Optional<Donor> donorOpt = donorRepository.findById(donorId);
                    if (donorOpt.isPresent()) {
                        Donor donor = donorOpt.get();
                        realDonorName = donor.getName();
                        donorLat = donor.getLatitude();
                        donorLng = donor.getLongitude();
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Invalid donor ID format");
                }
            }

            Double hospLat = request.getLatitude();
            Double hospLng = request.getLongitude();
            
            // FALLBACK COORDINATES (If donor or request doesn't have GPS enabled, mock it so the map still works)
            if (donorLat == null || donorLng == null) {
                donorLat = 22.9868;
                donorLng = 88.4314;
            }
            if (hospLat == null || hospLng == null) {
                hospLat = 22.9723;
                hospLng = 88.4342;
            }
            
            // Haversine formula to calculate distance
            double distanceKm = 0.0;
            if (donorLat != null && donorLng != null && hospLat != null && hospLng != null) {
                int r = 6371; // Earth radius in km
                double latDistance = Math.toRadians(hospLat - donorLat);
                double lonDistance = Math.toRadians(hospLng - donorLng);
                double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                        + Math.cos(Math.toRadians(donorLat)) * Math.cos(Math.toRadians(hospLat))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distanceKm = Math.round((r * c) * 10.0) / 10.0; // round to 1 decimal
            }

            // 2. Fire real-time update to the hospital's dashboard
            messagingTemplate.convertAndSend(
                    "/topic/requests/" + request.getRequester().getRequesterId(),
                    "{\"requestId\": " + requestId + 
                    ", \"status\": \"matched\"" +
                    ", \"donorName\": \"" + realDonorName + "\"" +
                    ", \"donorId\": " + payload.get("donorId") + 
                    (donorLat != null ? ", \"donorLat\": " + donorLat + ", \"donorLng\": " + donorLng : "") +
                    (hospLat != null ? ", \"hospLat\": " + hospLat + ", \"hospLng\": " + hospLng : "") +
                    ", \"distanceKm\": " + distanceKm +
                    "}"
            );
        }


        return ResponseEntity.ok(request);
    }

    @Autowired
    private com.anish.blooddonation.repository.DonationRecordRepository donationRecordRepository;

    @PostMapping("/requesters")
    public ResponseEntity<?> registerRequester(@RequestBody Requester requester) {

        // Ensure the account type matches exactly what AuthController expects for login
        requester.setAccountType("hospital_verified");

        try {
            if (requester.getPassword() == null || requester.getPassword().isEmpty()) {
                requester.setPassword("google_oauth_hospital_" + java.util.UUID.randomUUID().toString().substring(0, 8));
            }
            Requester newRequester = requesterRepository.save(requester);
            return ResponseEntity.ok(newRequester);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error saving requester: " + e.getMessage());
            // Returns 409 Conflict if email is already taken
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // BD-06 & BD-09: Complete Donation and update rewards
    @PostMapping("/donations/{requestId}/complete")
    @CacheEvict(value = {"adminAnalytics", "hospitalAnalytics"}, allEntries = true)
    public ResponseEntity<com.anish.blooddonation.model.DonationRecord> completeDonation(
            @PathVariable Long requestId,
            @RequestBody java.util.Map<String, Long> payload) {
        
        Long donorId = payload.get("donorId");
        Optional<BloodRequest> optionalRequest = requestRepository.findById(requestId);
        Optional<Donor> optionalDonor = donorRepository.findById(donorId);

        if (optionalRequest.isEmpty() || optionalDonor.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        BloodRequest request = optionalRequest.get();
        Donor donor = optionalDonor.get();

        request.setStatus("fulfilled");
        requestRepository.save(request);

        com.anish.blooddonation.model.DonationRecord record = new com.anish.blooddonation.model.DonationRecord();
        record.setDonor(donor);
        record.setRequest(request);
        donationRecordRepository.save(record);

        donor.setDonationCount(donor.getDonationCount() + 1);
        donor.setLastDonationDate(java.time.LocalDateTime.now());
        
        // Update reward tier (BD-09)
        int count = donor.getDonationCount();
        if (count >= 10) donor.setRewardTier("Gold");
        else if (count >= 5) donor.setRewardTier("Silver");
        else if (count >= 1) donor.setRewardTier("Bronze");
        
        donorRepository.save(donor);

        // Fire real-time achievement notification to the donor's dashboard
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> achievement = new java.util.HashMap<>();
            achievement.put("type", "DONATION_COMPLETED");
            achievement.put("donorName", donor.getName());
            achievement.put("bloodType", donor.getBloodType());
            achievement.put("units", request.getUnitsRequired() != null ? request.getUnitsRequired() : 1);
            achievement.put("units", request.getUnitsNeeded() != null ? request.getUnitsNeeded() : 1);
            achievement.put("totalDonations", donor.getDonationCount());
            
            messagingTemplate.convertAndSend(
                    "/topic/donors/" + donor.getDonorId() + "/achievements",
                    mapper.writeValueAsString(achievement)
                    (Object) achievement
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok(record);
    }

    // BD-06: Get Donation History
    @GetMapping("/donors/{donorId}/history")
    public ResponseEntity<List<com.anish.blooddonation.model.DonationRecord>> getDonationHistory(@PathVariable Long donorId) {
        List<com.anish.blooddonation.model.DonationRecord> history = donationRecordRepository.findByDonor_DonorIdOrderByDonationDateDesc(donorId);
        return ResponseEntity.ok(history);
    }

    // BD-06.5: Get Hospital Request History
    @GetMapping("/hospitals/{requesterId}/history")
    public ResponseEntity<List<BloodRequest>> getHospitalHistory(@PathVariable Long requesterId) {
        List<BloodRequest> history = requestRepository.findByRequester_RequesterIdOrderByCreatedAtDesc(requesterId);
        return ResponseEntity.ok(history);
    }
    
    // BD-11: Get Active Requests for Map
    @GetMapping("/requests/active")
    public ResponseEntity<List<BloodRequest>> getActiveRequests() {
        return ResponseEntity.ok(requestRepository.findByStatus("open"));
    }
    
    // Fetch individual donor by ID for getting updated tier/count
    @GetMapping("/donors/{donorId}")
    public ResponseEntity<Donor> getDonorById(@PathVariable Long donorId) {
        Optional<Donor> donor = donorRepository.findById(donorId);
        return donor.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
