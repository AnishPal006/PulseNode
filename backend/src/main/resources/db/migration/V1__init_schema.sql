CREATE TABLE donor (
    donor_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255),
    contact_email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status VARCHAR(255) NOT NULL DEFAULT 'pending',
    last_donation_date TIMESTAMP,
    donation_count INTEGER DEFAULT 0,
    reward_tier VARCHAR(255) DEFAULT 'None'
);

CREATE TABLE requester (
    requester_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255),
    contact_email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    account_type VARCHAR(255) NOT NULL
);

CREATE TABLE blood_request (
    request_id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES requester(requester_id),
    blood_type_needed VARCHAR(255) NOT NULL,
    units_needed INTEGER NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    urgency_level VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donation_record (
    record_id BIGSERIAL PRIMARY KEY,
    donor_id BIGINT NOT NULL REFERENCES donor(donor_id),
    request_id BIGINT NOT NULL REFERENCES blood_request(request_id),
    donation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_record (
    match_id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES blood_request(request_id),
    donor_id BIGINT NOT NULL REFERENCES donor(donor_id),
    compatibility_result VARCHAR(255) NOT NULL DEFAULT 'compatible',
    distance_km DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sosnotification (
    notification_id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL UNIQUE REFERENCES match_record(match_id),
    channel VARCHAR(255) NOT NULL DEFAULT 'push',
    message VARCHAR(255) NOT NULL,
    delivery_status VARCHAR(255) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE response (
    response_id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL UNIQUE REFERENCES sosnotification(notification_id),
    answer VARCHAR(255) NOT NULL,
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
