# DropBeam

Drop once. Access anywhere. The friction-free bridge between your devices.

DropBeam is a full-stack modern web application that allows users to instantly transfer files, text, links, and clipboard data between phone and laptop without login or installation.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, @stomp/stompjs
- **Backend**: Java Spring Boot, Spring Web, Spring WebSocket
- **Storage**: In-memory `ConcurrentHashMap` for maximum speed. Files are stored temporarily on the local disk.

## Features
- 🚀 **Instant File Transfer**: Generate a QR code to quickly connect and transfer files up to 100MB.
- 💬 **Text Sharing**: Paste text/code/snippets to share instantly.
- ⏳ **Temporary Rooms**: Rooms expire automatically after 15 minutes.
- ⚡ **Realtime Updates**: Instant live status updates powered by Spring WebSocket + STOMP.
- 🧹 **Auto Cleanup**: Scheduled tasks automatically delete expired files and rooms to free up memory.
- 🎨 **Beautiful UI**: Modern dark UI with glassmorphism, responsive for mobile and desktop.

## Running Locally

### Backend Setup
1. Navigate to the `backend` folder.
2. Ensure you have Java 17 and Maven installed.
3. Run the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
5. The frontend will start on `http://localhost:5173`.

## Deployment Guide

### Deploying the Backend (Render/Railway free tier)
1. Push the `backend` folder to a GitHub repository.
2. Connect the repository to Render/Railway.
3. **Build Command**: `mvn clean package`
4. **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
5. **Environment Variables**:
   - Make sure to set any necessary environment variables if you change the default configurations.

### Deploying the Frontend (Vercel)
1. Push the `frontend` folder to a GitHub repository.
2. Import the project into Vercel.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Set this to your deployed backend API URL (e.g., `https://your-backend.onrender.com/api`)
   - `VITE_WS_URL`: Set this to your deployed backend WebSocket URL (e.g., `https://your-backend.onrender.com/ws`)
