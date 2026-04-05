# Bike Stand E-Ticket Management System

A complete mobile-first solution for managing bike stand entries, exits, and payments with QR-based digital ticketing.

## 🚀 Features
- **Modern UI**: Clean, mobile-friendly design with intuitive icons (Lucide).
- **QR Tickets**: Auto-generates unique ticket IDs and QR codes for entry.
- **Smart Fee Calculation**: Calculates hourly parking rates automatically (Bike: ₹10/hr, Scooter: ₹20/hr).
- **Dashboard**: Real-time summary of today's total vehicles and revenue.
- **History**: Detailed transaction logs searchable by vehicle number.
- **Web Preview**: Public ticket preview and admin dashboard viewable in browsers.
- **Secure**: JWT-based authentication for Admin and Staff.

## 🛠️ Tech Stack
- **Frontend**: React Native (Expo SDK 55), React Navigation.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JSON Web Token (JWT).
- **QR Generation**: react-native-qrcode-svg.

---

## 🚀 Quick Commands
To run the app, open two separate terminals:

| Component | Command | Directory |
| :--- | :--- | :--- |
| **Backend** | `npm run dev` (with Auto-reload) or `npm start` | `/backend` |
| **Frontend** | `npm start` (Expo) | `/BikeStandApp` |

---

## ⚙️ Setup & Running

### 1. Backend Setup
1. Open terminal in the `backend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional):
   ```env
   MONGO_URI=mongodb://localhost:27017/bikestand
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server (Development mode):
   ```bash
   npm run dev
   ```
5. **Web Preview Routes**:
   - Ticket Preview: `http://localhost:5000/preview/{ticketId}`
   - Admin Dashboard Preview: `http://localhost:5000/admin-preview`

### 2. Frontend Setup
1. Open terminal in the `BikeStandApp/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **⚠️ IMPORTANT**: Update the `API_URL` in `src/services/api.js` to your local machine's IP address (e.g., `http://192.168.1.100:5000/api`) so the mobile app can reach the backend.
4. Start the Expo development server:
   ```bash
   npm start
   ```
5. Open the app using:
   - **Expo Go** app on your physical mobile device.
   - **Android Emulator** or **iOS Simulator**.

---

## 🔒 Default Login
The system auto-registers any username/password on the first login for demo purposes.
- **Username**: `admin`
- **Password**: `password123`

---

## 🏗️ Folder Structure
- `backend/`: Node.js Express API.
  - `models/`: Database schemas (User, Ticket).
  - `controllers/`: Business logic.
  - `routes/`: API endpoints.
  - `utils/`: JWT middleware.
- `BikeStandApp/`: React Native mobile app.
  - `src/screens/`: UI views.
  - `src/navigation/`: App routing.
  - `src/services/`: API integration.
  - `src/components/`: Reusable components.
