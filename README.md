# FoodConnect 🍲🌱
> **Smart Food Rescue, Quantum-Inspired Distribution & Circular Waste Management Platform**

FoodConnect bridges commercial food donors (restaurants, caterers, banquet halls, hotels) with local non-profit hunger relief organizations (NGOs) and municipal organic composting facilities to eliminate edible food waste and nourish communities.

---

## 🚀 Key Features

### 1. 🤖 Strict AI Quality & Edibility Inspection (Gemini Vision)
- Evaluates submitted food images using multimodal Gemini AI.
- Rigorous scoring criteria across freshness, visual hygiene, container cleanliness, and packaging.
- Strict grading (0–90%) with instant safety verdicts before listings go live.
- Automated fallback heuristic engine ensuring 100% platform uptime.

### 2. ⚛️ Quantum-Inspired Match Optimization (Simulated Quantum Annealing)
- Multi-objective optimization matching surplus food listings to the most suitable NGO.
- Factors in Euclidean geospatial distance, hunger urgency, vehicle capacity, and response speeds.
- Computes qubit energy states and optimal Hamiltonian cost functions.
- Automatic matchmaking upon listing submission with priority `#1 Quantum Best Pick` callouts.

### 3. 🚚 Secure OTP Handover & Order Lifecycle Tracking
- **Two-Phase Security Handover:** Generates a 4-digit security PIN given to the donor kitchen manager; verified upon NGO vehicle arrival.
- **Pre-Pickup Cancellation:** If cancelled before OTP verification, the order is removed in real time from both donor and receiver tracking.
- **Post-Pickup Guarantee:** Once verified with OTP, the receiver NGO retains full tracking and distribution authority even if the donor archives the order.
- Live interactive GPS routing map powered by OpenStreetMap & Leaflet.

### 4. ♻️ Circular Municipal Waste Management
- Food listings remain eligible for municipal green waste diversion until OTP verification.
- Integrated directory of official Municipal Solid Waste / Biomethanation corporations across major cities (Nagpur, Mumbai, Delhi, Bengaluru, Pune, Jaipur, etc.).
- 1-click scheduling for municipal organic collection trucks.

### 5. 🔄 Real-Time Multi-Device Cloud Sync & Live Chat
- Dual-mode data persistence via Google Cloud Firestore and local storage.
- Real-time peer-to-peer donor-NGO in-app chat.
- Live event notification system for new listings, matching alerts, and transit updates.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v7, Vite
- **Styling:** Custom Modular CSS with CSS Variables & Responsive Layouts
- **Maps & Geolocation:** Leaflet, OpenStreetMap, Custom Geocoding
- **AI & Optimization:** Google Gemini Multimodal Vision API, Simulated Quantum Annealing (SQA)
- **Database & Sync:** Cloud Firestore, Firebase Authentication, LocalStorage Resilience

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/diligentCode/Food-Management.git
   cd Food-Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
