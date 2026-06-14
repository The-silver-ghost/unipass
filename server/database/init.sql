-- Enable UUID extension (just in case you are on an older PG version, though PG 13+ has gen_random_uuid built-in)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER Table (Base table)
CREATE TABLE "USER" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- e.g., 'student', 'organizer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EVENT Table
CREATE TABLE "EVENT" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES "USER"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INT NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Draft', 'Published', 'Cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. REGISTRATION Table (Linking Students to Events)
CREATE TABLE "REGISTRATION" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES "USER"(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES "EVENT"(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL -- e.g., 'Pending', 'Confirmed', 'Refunded'
);

-- 4. PAYMENT_LOG Table
CREATE TABLE "PAYMENT_LOG" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- e.g., 'FPX', 'E-Wallet', 'Free'
    transaction_type VARCHAR(50) NOT NULL, -- e.g., 'Payment', 'Refund'
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Success', 'Failed'
    paid_at TIMESTAMP WITH TIME ZONE,
    receipt_ref VARCHAR(255)
);

-- 5. NOTIFICATION Table
CREATE TABLE "NOTIFICATION" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- e.g., 'In-App', 'Email'
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 6. EPASS Table (The digital ticket)
CREATE TABLE "EPASS" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(50) NOT NULL, -- e.g., 'Active', 'Scanned', 'Expired'
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- 7. EPASS_STATE_LOG Table (Tracking ticket state changes)
CREATE TABLE "EPASS_STATE_LOG" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epass_id UUID NOT NULL REFERENCES "EPASS"(id) ON DELETE CASCADE,
    triggered_by UUID NOT NULL REFERENCES "USER"(id), -- Who scanned/changed it
    old_state VARCHAR(50) NOT NULL,
    new_state VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);