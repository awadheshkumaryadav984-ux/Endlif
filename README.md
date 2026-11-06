# Endlif — AI Safety Intelligence & Emergency Response Platform

Endlif is a personal safety and emergency response ecosystem featuring **Achyuta AI Guardian Intelligence**, safety check-in countdowns, a trusted guardian Safety Circle, emergency SOS dispatch, and real-time safety navigation.

---

## 🌟 Key Features

- **Achyuta AI Guardian**:
  - Live AI safety companion with natural voice and text intelligence powered by Google Gemini.
  - Verified search grounding for real-time safety queries and local emergency numbers.
  - Context-aware threat detection and guidance with zero panic.

- **Safety Verification Engine**:
  - Timed safety check-in countdowns (15m, 30m, 1h).
  - Multi-tier escalation protocol if a check-in is missed (reminder nudge &rarr; audio alert &rarr; automated alerts to Safety Circle).

- **Safety Circle (Trusted Guardians)**:
  - Coordinate assistance with family and emergency contacts.
  - Broadcast real-time location, safety status, and alerts.

- **Emergency SOS Beacon**:
  - One-tap SOS trigger with instant siren, flashlight strobe, and automatic emergency dialer (112 / 911 / 100).
  - Emergency contact broadcast with accurate GPS coordinates.

- **Safety Radar & Real-Time Resources**:
  - Nearby hospitals, police stations, and verified emergency facilities via Google Maps.
  - Direct turn-by-turn navigation corridors and illuminated transit routes.

- **Client-Side Encrypted Storage**:
  - Local database obfuscation and cryptographic scrambler protecting emergency numbers and profile data.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Framer Motion)
- **Backend / Proxy**: Express, Node.js (with `vite.middlewares` in development)
- **AI Intelligence**: `@google/genai` TypeScript SDK (Gemini models)
- **Mapping & Geocoding**: `@vis.gl/react-google-maps` (Google Maps Platform)
- **Build System**: Vite 6, esbuild, TypeScript 5.8

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/endlif.git
cd endlif
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your API keys to `.env`:

```env
# Required for Gemini AI safety responses:
GEMINI_API_KEY="your-gemini-api-key-here"

# Required for Google Maps and nearby emergency places:
GOOGLE_MAPS_PLATFORM_KEY="your-google-maps-api-key-here"

# App URL (default: http://localhost:3000)
APP_URL="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Start

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── .env.example          # Environment variables template
├── index.html            # Main HTML entry point
├── metadata.json         # AI Studio applet capabilities and permissions
├── package.json          # Project dependencies and npm scripts
├── server.ts             # Express backend server & Gemini API proxy
├── src/
│   ├── App.tsx           # Primary application view manager
│   ├── main.tsx          # React application root
│   ├── index.css         # Tailwind CSS styling and theme setup
│   ├── data.ts           # Initial contacts and verified safety presets
│   ├── types.ts          # Core TypeScript models and interfaces
│   ├── components/       # UI Screens (Home, Assistant, Circle, SOS, Resources, Account)
│   ├── services/         # Location, Check-in, Alert & Notification services
│   └── utils/            # Cryptographic storage & security diagnostics
├── tsconfig.json         # TypeScript compiler configuration
└── vite.config.ts        # Vite configuration
```

---

## 🔒 Security & Privacy

- All user profile details, emergency contacts, and check-in records are kept secure on device.
- API keys are handled server-side through the Express proxy (`/api/achyuta/*`) and never leaked to the client bundle.
- No personal data or live coordinates are collected or sold.

---

## 📄 License

This project is open source under the MIT License.
