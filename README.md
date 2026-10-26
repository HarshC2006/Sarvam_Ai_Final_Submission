# आवेदन · Aavedan
### *AI-Powered Application Preparation & Documentary Evidence Verification Assistant*
**Powered by Sarvam AI (Vision Doc AI · Sarvam-105B · Bulbul TTS · Saaras STT)**

---

## 1. Overview & Product Objective

**Aavedan** converts complicated institutional scholarship requirements and scattered applicant records into an auditable, verified application draft.

Unlike generic informational chatbots, Aavedan functions as an **active transactional state machine** that:
1. Ingests official scholarship guidelines and applicant documents.
2. Extracts structured facts with exact source citations (`document`, `page`, `verbatim passage`).
3. Evaluates statutory rules with a deterministic evaluator (`gte`, `lte`, `eq`, `required_document`).
4. **Distinguishes user assertions from verified documentary proof** (e.g., self-reported ₹1.8L income cannot fulfill the revenue certificate requirement until the certificate is attached).
5. **The Signature Hero Moment**: An applicant uploads their missing Tehsildar income certificate, and the requirement, source evidence card, and application draft update together in a smooth visual resolution with natural Hindi/English audio confirmation.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (Minimalist Light Civic Theme: Warm Ivory `#FAF8F5`, Deep Forest Green `#1B4332`, Muted Stone `#E7E5E4`), Lucide Icons.
- **Backend**: FastAPI, Pydantic, Python Standard Library SQLite (`sqlite3`), Private Storage for uploads.
- **Sarvam AI Models & SDK**:
  - **Sarvam Vision / Doc AI** (`POST /doc-ai/v1/job/digitise`): Asynchronous layout-preserving OCR into Markdown.
  - **Sarvam-105B** (`POST /v1/chat/completions`): 105B+ Mixture-of-Experts reasoning engine extracting structured entities into strict JSON schemas.
  - **Bulbul TTS** (`POST /text-to-speech` with `bulbul:v3`): Natural Indian voice guidance (`shubh` for `hi-IN`, `aditya` for `en-IN`).
  - **Saaras STT** (`POST /speech-to-text` with `saaras:v4`): Speech-to-text transcription for voice clarifications.

---

## 3. Two Honest Operating Modes

- **Live Sarvam Mode**: Actual document processing through Sarvam Doc AI, 105B reasoning, Bulbul speech synthesis, and Saaras speech recognition.
- **Fixture Demo Mode**: Synthetic documents and reproducible test scenarios evaluated using the same deterministic engine, state management, and export pipeline.
- The active mode is clearly badged in the header at all times.

---

## 4. Setup & Running Instructions

### Prerequisites
- Python 3.10+ (with `uv` or `pip`)
- Node.js v18+ and `npm`

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/HarshC2006/Sarvam_Ai_Final_Submission.git
   cd Sarvam_Ai_Final_Submission
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .\.venv\Scripts\activate

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic sarvamai httpx python-multipart pytest
   ```
4. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your SARVAM_API_KEY
   ```
5. Run the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

### Frontend Setup
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server (with proxy to port 8000):
   ```bash
   npm run dev
   ```
3. Open your browser at **http://127.0.0.1:5173** (or access the compiled bundle at **http://127.0.0.1:8000**).

---

## 5. Resettable Test Scenarios

1. **⚡ Case 1 (Hero Flow - 75% Incomplete)**:
   - Applicant **Asha Sharma** has 84% marks (CBSE Class XII) and full-time enrollment at Miranda House, Delhi University.
   - Household income is stated as ₹1.8L, but the official Income Certificate is missing.
   - Click **`⚡ Upload Income Certificate`** to watch the blocker resolve in real time, advance to 100%, and play Bulbul audio confirmation!
2. **Case 2 (100% Complete)**:
   - All 4 conditions met, all documentary proof verified, ready to export printable PDF packet.
3. **Case 3 (Ineligible - Rohan Mehta)**:
   - Certified income is ₹3,20,000, which exceeds the statutory ₹2,50,000 ceiling. System correctly marks condition as not met with citation.
4. **Case 4 (Conflicting Identities)**:
   - Name mismatch between Marksheet ("Ashish Sharma") and Aadhaar ("Asha Sharma"). System flags review required rather than merging identities.

---

## 6. 90-Second Demonstration Script

1. **0:00 - 0:15 (The Problem & Architecture)**:
   - Show the 3-panel workspace: Requirements (Left), Evidence Inspector (Center), Application Draft (Right).
   - Point out the opening status: *Udaan Education Grant — Demonstration Programme (₹25,000)*.
2. **0:15 - 0:30 (Institutional Distinction)**:
   - Show that Asha Sharma has 84% marks and full-time enrollment verified.
   - Show the Income requirement: The applicant verbally stated ₹1.8 lakh, but Aavedan correctly classifies it as an *Unverified Self-Reported Claim*, keeping the requirement at 75% with a red blocker.
3. **0:30 - 0:45 (Bulbul TTS Audio Guidance)**:
   - Click **"सुनो (Bulbul TTS)"**. Listen to the natural Hindi speech narrating the exact blocker: *"कृपया आय सीमा नियम को पूरा करने के लिए अपना आधिकारिक तहसीलदार आय प्रमाण पत्र अपलोड करें।"*
4. **0:45 - 1:05 (The Signature Hero Moment)**:
   - Click **`⚡ Upload Income Certificate`**.
   - Watch the certificate get processed by Sarvam 105B.
   - In Panel 3, the amber field triggers a green pulse animation and updates to: `₹1,80,000 (Verified by Tehsildar Office) ✅`.
   - Progress bar jumps to **100% Complete**.
   - Bulbul announces: *"आपका आय प्रमाण पत्र सत्यापित हो गया है। आवेदन पत्र अब पूर्ण है और जमा करने के लिए तैयार है।"*
5. **1:05 - 1:20 (PDF Application Export)**:
   - Click **"Export Application Packet & Checklist (PDF)"** to reveal the printable institutional packet with verified checklist and pending signature block.
6. **1:20 - 1:30 (Condition Failure & Edge Cases)**:
   - Switch to **Case 3 (Rohan Mehta)** to show statutory income failure (₹3.2L > ₹2.5L).
   - Toggle **`Live Sarvam`** to highlight real-time API health checks.
