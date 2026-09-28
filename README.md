# Ride Buddy 🚗🏍️

**Ride Buddy** is a cross-platform mobile application (Android & iOS) designed for carpooling and petrol cost sharing along overlapping routes in India.

Unlike taxi-booking applications, Ride Buddy connects drivers who are already traveling to a destination with passengers going along the same route. The users split only the estimated fuel cost.

---

## 🌟 Key Features

1. **Phone Number + OTP Authentication (+91)**
   - Fast login via 6-digit OTP code with countdown timers, resend logic, and instant user verification.

2. **Route Overlap Matching**
   - Passengers do not need exact start/end match with drivers.
   - Route matching algorithm evaluates intermediate pickup and drop-off points along the driver's path (e.g. Driver `A → B → C → D → E`, Passenger `B → D`).
   - Calculates a real route-match percentage (e.g. `92% match`).

3. **Women-Only Safe Rides**
   - Option for drivers and passengers to filter rides for **Women only**.
   - Strictly enforced on the backend from verified user profile gender.

4. **Estimated Petrol Share Calculation**
   - Automatically estimates fuel cost based on passenger segment distance, vehicle mileage (km/L), fuel price (₹/L), and number of people sharing the vehicle.
   - Clear disclaimer: Ride Buddy V1 does not process payments; users settle estimated fuel shares directly.

5. **Seat Capacity & Overbooking Protection**
   - Capacity rules: Bike (1 passenger max), Car (1–6 passengers).
   - Atomic database transactions prevent overbooking.

6. **Ride Lifecycle & My Rides**
   - Ride states: `PUBLISHED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
   - Driver controls: `Start Ride` and `Complete Ride`.
   - "My Rides" view divided into **Upcoming**, **Active**, and **History**.

7. **Ride Chat, Ratings & Safety**
   - Ride-specific chat for confirmed driver and passengers.
   - 1–5 star ratings and comments following completed rides.
   - Safety reporting (Unsafe behavior, harassment, no-show, wrong info) and user blocking.

---

## 🏗️ Architecture & Tech Stack

### Mobile Stack
- **Framework**: React Native with Expo & TypeScript
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **UI/UX**: Custom design system based on approved design language (`prototype.html`)

### Backend Stack
- **Framework**: Python 3.11 + FastAPI (Modular Monolith)
- **Database**: PostgreSQL (SQLAlchemy ORM with SQLite fallback for unit tests)
- **Security**: PyJWT token validation (`Authorization: Bearer <token>`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Expo Go app or Android/iOS Simulator

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/Mac:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run unit and API tests:
   ```bash
   pytest
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API interactive docs will be available at `http://localhost:8000/docs`.

---

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

4. Start the Expo development server:
   ```bash
   npm start
   ```

---

## 🧪 End-to-End Acceptance Criteria Scenario

1. New user opens Ride Buddy and enters an Indian phone number (`+91 98765 43210`).
2. Receives and verifies 6-digit OTP (`482169`).
3. Creates a minimal profile (Name: *Ananya*, Gender: *Female*).
4. Reaches Home screen and registers a Car vehicle (*Honda City*, 3 seats, 15 km/L).
5. Offers a ride from *Kakinada* → *Rajahmundry* marked as **Women only**.
6. System calculates route segment fuel share.
7. Another female passenger searches for *Samalkota* → *Rajahmundry* with **Women only** filter.
8. System identifies overlapping route and displays match score (`92% match`) and petrol share (`₹85`).
9. Passenger requests a seat.
10. Driver receives request, accepts seat, and available seat count updates atomically.
11. Driver taps `Start Ride` → Passenger sees status change to *In Progress*.
12. Driver taps `Complete Ride` → Ride moves to *History*.
13. Both driver and passenger submit 1-5 star ratings for each other.

---

## 🔒 Security & Privacy

- Authentication tokens (JWT) verify identity on every protected endpoint.
- User IDs from client inputs are never trusted; user identity is decoded from bearer tokens.
- Private phone numbers and precise addresses are hidden; landmark points are used for pickup/drop coordinates.
