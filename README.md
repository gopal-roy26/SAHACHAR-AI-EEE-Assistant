```markdown
<div align="center">

# ⚡ SAHACHAR (সহচর)
### An AI-Powered EEE Learning, Circuit Simulation & Academic Assistant Engine

[![React.js](https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/AI_Engine-Groq_API-orange?style=for-the-badge)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_Flash-yellow?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 📖 About The Project

**SAHACHAR (সহচর)** is a next-generation, client-side intelligent web platform built exclusively for **Electrical and Electronic Engineering (EEE)** students. 

It bridges the gap between abstract theoretical concepts and practical engineering by combining a dual-AI academic professor, interactive hardware/logic simulators, an online digital library, and curriculum tools into a single, cohesive ecosystem.

---

## 🏛️ System Architecture & Tech Stack

Sahachar operates as a high-performance **Single Page Application (SPA)**. Instead of a traditional monolithic backend server, it utilizes a modern serverless frontend architecture that directly communicates with high-speed AI inference engines and browser-based sandboxes.

### 🎨 Frontend & UI Layer
* **Core Library:** React.js (Functional Components, Custom Hooks)
* **Build Tool:** Vite (For lightning-fast bundling & Hot Module Replacement)
* **Styling & Theme:** Tailwind CSS, Custom Glassmorphism, Dark/Light Mode Engine

### 🤖 Intelligence & Reasoning Layer
* **Primary AI Engine:** Groq API (`gpt-oss-120b`, `llama-3.1-8b-instant`)
* **Secondary AI Engine:** Google Gemini 3.6 Flash API
* **Math & Equations:** `react-markdown`, `remark-math`, `remark-gfm`, `rehype-katex` (Professional LaTeX rendering)
* **Diagrams:** Mermaid.js & Custom SVG Vector Circuit Pipelines

### 🛠️ Utilities & Storage Layer
* **Data Persistence:** Browser `LocalStorage` (For custom API keys and uploaded labs)
* **Secure Sandbox:** HTML5 `iframe` with strict attribute sandboxing for custom `.html` lab simulations
* **Native Viewport:** Browser Fullscreen API for distraction-free workspace execution

---

## 🚀 Core Features & Capabilities

### 1. 🤖 Dual-AI Engineering Professor
* Structured pedagogical responses following textbook standards: *Introduction, Schematics, Working Principle, Mathematical Derivations, and Truth Tables*.
* Dual-AI failover and rotation support (Groq + Gemini) with automated rate-limit cooldown timers.

### 2. 🎛️ Interactive Digital Logic & Ohm's Law Simulators
* **Logic Gates:** Real-time binary state toggling ($0/1$) for AND, OR, NOT, NAND, NOR, XOR, XNOR, Half Adder, and Full Adder circuits with live Truth Table highlighting and LED output indicators.
* **Ohm's Law Engine:** Dynamic voltage and resistance range sliders driving an animated electron-flow pathway with instant current computation ($I = V/R$).

### 3. 📚 EEE Digital Library Hub
* Curated reference catalog for fundamental EEE textbooks categorized by *Circuits, Electronics, Machines, Digital Logic, and Energy Conversion*.
* Glassmorphism card layouts featuring real-time search filtering and direct secure cloud-reader integration.

### 4. 📜 Department Syllabus Viewer
* Embedded official curriculum guidelines with native Fullscreen support and quick-access Google Drive integration.

### 5. 🧰 Virtual Lab Explorer
* Dynamic custom HTML lab file uploader (`.html`) allowing students and instructors to execute standalone simulation scripts within a secure environment.

---

## 🛠️ Installation & Local Setup

To run **Sahachar** locally on your machine, follow these simple steps:

### Prerequisites
Make sure you have **Node.js** installed on your system.

### Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/sahachar.git](https://github.com/your-username/sahachar.git)
   cd sahachar

```

2. **Install dependencies:**
```bash
npm install

```


3. **Start the development server:**
```bash
npm run dev

```


4. **Open in browser:**
Navigate to `http://localhost:5173` in your web browser.
*(Note: You can configure your Groq or Gemini API keys directly inside the application via the built-in **Key Manager** modal).*

---

## 👥 Project Team & Academic Submission

* **Institution:** Begum Rokeya University, Rangpur (BRUR)
* **Department:** Department of Electrical and Electronic Engineering (EEE)
* **Course Instructor / Submitted To:** A. K. M. Mahmudul Haque, Assistant Professor
* **Project Team / Submitted By:**
* **Gopal Chandro Roy** (ID: 12216058)
* **Pingky Roy Sarker** (ID: 12216048)



---

## 📄 License

This project is developed as an academic submission for the Department of EEE, Begum Rokeya University, Rangpur. All rights reserved.

