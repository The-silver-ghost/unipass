# UniPass

A comprehensive university event management system designed to facilitate seamless event posting, payment processing, ticket issuance, and gate verification using a dynamic QR system.

> This is an academic project from the Multimedia University curriculum and is not a production product. This project is designed to demonstrate clean architecture and software engineering design patterns.

---

## Technology Stack & Architecture

- **Frontend Mobile App**: React Native with **Expo Router** (TypeScript)
- **Backend API Server**: Node.js with **Express** (TypeScript)
- **Database**: **PostgreSQL**
- **Design Patterns Demonstrated**:
  - **Strategy Pattern** (Payment processing)
  - **State Pattern** (E-Pass ticket states)
  - **Factory Method & Template Method Patterns** (User creation & registration)
  - **Observer Pattern** (Broadcasting announcements & in-app notifications)
  - **Singleton Pattern** (User Session management)

---

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or newer recommended)
- **npm** (v9.0.0 or newer)
- **PostgreSQL** (v13 or newer)
- **Expo Go** app installed on your physical mobile device (if testing over Wi-Fi)

---

## Installation & Setup Guide

### 1. Clone & Install Dependencies
Run `npm install` in both the server and mobile folders to download the required frameworks and libraries.

```bash
# Install backend dependencies
cd server
npm install

# Install frontend mobile dependencies
cd ../mobile
npm install
```

---

### 2. Configure Environment Variables (`.env`)

#### Backend Configuration
Create a `.env` file in the **`server`** directory (using `.env.example` as a template) and add your local database credentials:
```env
DB_PASSWORD=your_local_postgresql_password
```

#### Frontend Configuration
Create a `.env` file in the **`mobile`** directory and specify the URL of the backend API:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```
> [!TIP]
> If testing on an **Android Emulator**, use loopback IP `http://10.0.2.2:5000/api`.
> If testing on a **Physical Device (Expo Go)**, use your machine's local Wi-Fi IP address (e.g. `http://192.168.1.100:5000/api`).

---

### 3. Database Setup

1. **Create the Database**:
   Open your database client (e.g. pgAdmin or `psql`) and create a new PostgreSQL database:
   ```sql
   CREATE DATABASE unipass_db;
   ```

2. **Initialize Tables**:
   Execute the SQL commands below against your `unipass_db` database to construct the schema:
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- 1. USER Table
   CREATE TABLE "USER" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       student_id VARCHAR(255),
       full_name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       role VARCHAR(50) NOT NULL,
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
       status VARCHAR(50) NOT NULL,
       bank_name VARCHAR(255),
       account_number VARCHAR(255),
       account_holder VARCHAR(255),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       event_end_date TIMESTAMP WITH TIME ZONE
   );

   -- 3. REGISTRATION Table
   CREATE TABLE "REGISTRATION" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       student_id UUID NOT NULL REFERENCES "USER"(id) ON DELETE CASCADE,
       event_id UUID NOT NULL REFERENCES "EVENT"(id) ON DELETE CASCADE,
       registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR(50) NOT NULL
   );

   -- 4. PAYMENT_LOG Table
   CREATE TABLE "PAYMENT_LOG" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       registration_id UUID NOT NULL REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
       method VARCHAR(50) NOT NULL,
       transaction_type VARCHAR(50) NOT NULL,
       amount DECIMAL(10, 2) NOT NULL,
       status VARCHAR(50) NOT NULL,
       paid_at TIMESTAMP WITH TIME ZONE,
       receipt_ref VARCHAR(255)
   );

   -- 5. NOTIFICATION Table
   CREATE TABLE "NOTIFICATION" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       registration_id UUID REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
       type VARCHAR(50) NOT NULL,
       channel VARCHAR(50) NOT NULL,
       status VARCHAR(50) NOT NULL,
       sent_at TIMESTAMP WITH TIME ZONE,
       message TEXT,
       user_id UUID REFERENCES "USER"(id),
       event_id UUID REFERENCES "EVENT"(id)
   );

   -- 6. EPASS Table
   CREATE TABLE "EPASS" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       registration_id UUID NOT NULL REFERENCES "REGISTRATION"(id) ON DELETE CASCADE,
       qr_code VARCHAR(255) UNIQUE NOT NULL,
       state VARCHAR(50) NOT NULL,
       issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       used_at TIMESTAMP WITH TIME ZONE,
       is_hidden BOOLEAN DEFAULT FALSE
   );

   -- 7. EPASS_STATE_LOG Table
   CREATE TABLE "EPASS_STATE_LOG" (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       epass_id UUID NOT NULL REFERENCES "EPASS"(id) ON DELETE CASCADE,
       triggered_by UUID NOT NULL REFERENCES "USER"(id),
       old_state VARCHAR(50) NOT NULL,
       new_state VARCHAR(50) NOT NULL,
       changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

## Run the Application

### Option A: The Batch Launcher (Recommended for Windows)
Simply double-click the **`run.bat`** file in the root folder of this project.
The script will automatically:
1. Detect and print your local IP addresses.
2. Ask you to select your preferred startup configuration (e.g. Backend + Mobile app).
3. Spawn individual CMD windows for both servers to run them concurrently.

### Option B: Manual Execution
If you are running on another OS or prefer manual control, open two separate terminal instances:

#### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

#### Terminal 2: Start Mobile Client
```bash
cd mobile
npx expo start
```
From the Expo Metro interactive console, press:
- `a` to run on Android emulator or connected device.
- `i` to run on iOS Simulator (macOS only).
- `w` to launch in the web browser.
