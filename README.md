<p align="center">
  <img src="client/public/vanguard-banner.png" alt="Vanguard Banner" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/Jayanti29/VANGUARD">
    <img src="https://img.shields.io/badge/Vanguard-Hackathon_Submission-9c27b0?style=for-the-badge&logo=github" alt="Vanguard Hackathon" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React Badge" />
  </a>
  <a href="https://firebase.google.com">
    <img src="https://img.shields.io/badge/Firebase-Backend-ffca28?style=for-the-badge&logo=firebase" alt="Firebase Badge" />
  </a>
  <a href="https://ai.google.dev">
    <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285f4?style=for-the-badge&logo=google-gemini" alt="Gemini Badge" />
  </a>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-Supported-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript Badge" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind Badge" />
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel" alt="Vercel Badge" />
  </a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?lines=AI-Powered+Civic+Safety+Analyzer;Real-time+Village+Emergency+Broadcaster;Peer-to-Peer+Worker+Marketplace;Localized+Official+Inspector+Dashboard&font=Outfit&size=16&center=true&width=500&color=22C55E" alt="Vanguard Typing Animation" />
</p>

---

<p align="center">
  <strong>Vanguard is an AI-powered rural community protection and peer-to-peer labor marketplace designed to empower local citizens, assist nearby workers, organize safety volunteers, and streamline official civic audits.</strong>
</p>

---

## 🚀 Live Demo & Presentation

- **Production App**: [https://client-eight-sigma-10.vercel.app](https://client-eight-sigma-10.vercel.app)
- **Deployment Endpoint**: [https://client-9v1zg6a52-jayanti29s-projects.vercel.app](https://client-9v1zg6a52-jayanti29s-projects.vercel.app)
- **Demo Video**: [Watch Vanguard Presentation](https://client-eight-sigma-10.vercel.app)

---

## 📖 Table of Contents
- [Founder Story](#-founder-story)
- [The Problem Statement](#-the-problem-statement)
- [Our Solution](#-our-solution)
- [AI Engine Features](#-ai-engine-features)
- [Architecture & Workflow](#-architecture--workflow)
- [Platform Dashboards](#-platform-dashboards)
- [Tech Stack](#-tech-stack)
- [Installation Guide](#-installation-guide)
- [Deployment](#-deployment)
- [Roadmap](#-future-roadmap)
- [Social Impact](#-social-impact)
- [License](#-license)

---

## 💡 Founder Story

During a visit to a rural village in Karnataka, we witnessed a dangerous electrical wire dangling near an primary school field. Though the villagers immediately noticed the risk, there was no digital channel to record it, estimate safety severity, or report it to local ward officials. Additionally, skilled workers (plumbers, electricians) had to travel to cities for day job postings, leaving the community dry when emergencies hit.

We built **Vanguard** to close this rural-digital gap. By fusing **multimodal AI (Gemini Pro)**, real-time Firestore database synchronization, and local languages, Vanguard acts as a civic guardian and labor ecosystem in the pocket of every villager.

---

## ⚠️ The Problem Statement

Rural and semi-urban communities face significant structural challenges:
1. **Unreported Civic Hazards**: Water logging, open electrical cables, and damaged roads are left unresolved due to complex municipal red tape.
2. **Disconnected Emergency Alerts**: Localized issues (fires, floods, medical needs) require immediate community sirens to geolocate volunteers, yet local sirens do not exist.
3. **Inefficient Day Labor Markets**: Rural workers lack an online directory to declare local daily availability and negotiate daily wages with nearby residents.

---

## ✨ Our Solution

**Vanguard** is structured as a single-page digital guardian offering:
- **Multimodal AI Safety Audits**: Upload a photo of a hazard; Vanguard returns category labels, impact scores, risk analysis, and draft PDF complaint files automatically.
- **Geolocated Live Maps**: See nearby active concerns and locations.
- **Multilingual Community Channels**: Discuss concerns in English, Hindi, Kannada, Tamil, or Telugu.
- **Availability-Based Worker Registry**: Book local workers directly without intermediaries.

---

## 🤖 AI Engine Features

Vanguard integrates the **Google Gemini API** directly into two core modules:

### 1. Multimodal Civic Audit Analyzer
When a citizen uploads an image of a hazard, Vanguard triggers a Google AI Studio `generateContent` sequence, extracting:
- **Category & Severity**: Standard classifications (Red, Orange, Yellow, Green) for prioritization.
- **Civic Impact Score**: A computed gauge (0–100) reflecting hazard severity and proximity to public buildings (e.g. schools, markets).
- **Risk Prediction**: Text forecasting potential escalations (e.g. "Water ponding creates breeding grounds for Dengue vectors").
- **Government Authority Recommendation**: Mapped municipal department (e.g. Bescom, Water Board).

### 2. Conversational Assistant
An interactive voice-enabled AI companion supporting native speech input and voice synthesis (Web Speech API) to guide users on filing reports and safety procedures.

---

## 🏗️ Architecture & Workflow

### Agentic AI Pipeline
```mermaid
flowchart TD
    Citizen([Citizen Uploads Photo]) -->|Gemini Pro Vision| AI_Agent{AI Safety Analyzer}
    AI_Agent -->|Classify Category| Cat[e.g., Broken Wire]
    AI_Agent -->|Determine Severity| Sev[Red / Orange / Yellow]
    AI_Agent -->|Risk Prediction| Risk["Electrocution risk (School 150m away)"]
    AI_Agent -->|Calculate Impact Score| Score[Score: 0-100]
    AI_Agent -->|Assign Authority| Auth[Electricity Board]
    
    AI_Agent -->|Action 1: Client-Side| PDF[Generate Complaint PDF]
    AI_Agent -->|Action 2: Firestore| Store[Save Issue Document]
    Store -->|FCM Trigger| FCM[Broadcast Alert to Nearby Volunteers]
    Store -->|Broadcast Alert| Chat[Post to Community Emergency Channel]
```

### System Architecture
```mermaid
graph LR
    subgraph Client App
        UI[React + Tailwind CSS]
        Voice[Speech & Voice synthesis]
        PDFGen[html2canvas PDF Generator]
    end
    
    subgraph Firebase Backend
        Auth[Firebase OTP & Google Auth]
        DB[(Cloud Firestore)]
        Storage[(Firebase Asset Storage)]
    end

    subgraph AI Model Interface
        Gemini[Google Gemini API Studio]
    end

    UI --> Auth
    UI --> DB
    UI --> Storage
    UI --> Gemini
```

---

## 🎛️ Platform Dashboards

Vanguard adapts dynamically to four roles:

| Citizen View | Worker View | Official View | Volunteer View |
| :--- | :--- | :--- | :--- |
| • Report issues using camera<br>• Chat with community channels<br>• Access i18n languages | • Toggle "Available for Work"<br>• List skills & daily rate<br>• Apply directly to job posts | • View critical statistics dashboard<br>• Mark issues as In Progress/Resolved<br>• Slide-over detail panel | • Real-time emergency siren feed<br>• Verify community hazard reports<br>• Respond as dispatcher |

---

## 🛠️ Tech Stack

<table w-full>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technologies Used</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Frontend</b></td>
      <td>React 18, Vite, Framer Motion, React Router v6, Lucide Icons, React Leaflet (OpenStreetMap)</td>
    </tr>
    <tr>
      <td><b>Backend</b></td>
      <td>Firebase Authentication, Cloud Firestore, Firebase Storage</td>
    </tr>
    <tr>
      <td><b>AI Engine</b></td>
      <td>Google Gemini 1.5 Flash API, Web Speech API (Synthesis & Recognition)</td>
    </tr>
    <tr>
      <td><b>Styling</b></td>
      <td>Vanilla CSS variables, Tailwind CSS, Dark/Light theme providers</td>
    </tr>
  </tbody>
</table>

---

## ⚙️ Installation Guide

<details>
<summary>Click to expand setup instructions</summary>

### Prerequisites
- Node.js (v18+)
- Firebase Project setup
- Google Gemini API Key

### 1. Clone & Install
```bash
git clone https://github.com/Jayanti29/VANGUARD.git
cd VANGUARD/client
npm install
```

### 2. Configure Environment
Create `client/.env` and paste:
```env
VITE_FIREBASE_API_KEY=your_val
VITE_FIREBASE_AUTH_DOMAIN=your_val
VITE_FIREBASE_PROJECT_ID=your_val
VITE_FIREBASE_STORAGE_BUCKET=your_val
VITE_FIREBASE_MESSAGING_SENDER_ID=your_val
VITE_FIREBASE_APP_ID=your_val
VITE_GEMINI_API_KEY=your_google_ai_studio_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
</details>

---

## 🚢 Deployment

Vanguard is fully optimized for **Vercel** production deployment:

```bash
# Verify compilation build
npm run build

# Deploy client folder to production
npx vercel --prod
```

---

## 📈 Future Roadmap

- [ ] **Mobile Native Push**: Implement FCM Service Worker for native mobile notification badges.
- [ ] **Offline Firestore Sync**: Support offline issue drafting when mobile coverage is unavailable in deep rural areas.
- [ ] **Local SMS Gateway**: Integrate Twilio SMS notifications for feature-phone users who lack smartphone apps.
- [ ] **Gemini Translation Cache**: Cache common safety translations locally to reduce API roundtrip latencies.

---

## 🤝 Social Impact

Vanguard aims to directly impact rural sustainable development targets (SDGs):
- **SDG 11 (Sustainable Cities & Communities)**: Reducing civic hazards through rapid decentralized safety reporting.
- **SDG 8 (Decent Work & Economic Growth)**: Disintermediating local day labor markets, helping day workers keep 100% of their daily earnings.
- **SDG 16 (Peace, Justice & Strong Institutions)**: Establishing transparent civic complaint registries visible to municipal officers.

---

## 📄 License
This project is licensed under the **MIT License**. Feel free to use, modify, and distribute. See [LICENSE](LICENSE) for details.
