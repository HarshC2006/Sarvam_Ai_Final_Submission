# आवेदन · Aavedan

### Turning documentary requirements into clear, actionable application preparation

**Built with Sarvam AI: Sarvam-105B · Bulbul · Saaras · Sarvam Vision integration**

**Developed by Namya Sheth and Harsh Chandwani**

[Problem](#the-problem) · [Sarvam architecture](#sarvam-at-the-core) · [Demo](#demonstration-workflow) · [Run locally](#run-locally) · [Validation](#testing-and-validation) · [Scope](#current-scope-and-next-steps)

---

## Overview

Aavedan addresses a practical barrier to accessing opportunities: **people can satisfy an institution's requirements and still struggle to prepare a complete, consistent application.**

Scholarships offer a concrete example. Applicants must understand eligibility conditions, identify the documents that substantiate each condition, distinguish missing information from missing evidence, and transfer the right facts into an application. A marksheet, an enrollment letter and an income certificate each establish something different. A spoken explanation can help clarify a case, but it cannot replace a required certificate.

We built Aavedan to bring these steps into one connected workspace. It presents requirements, supporting evidence and an application draft together, with Hindi/English voice guidance powered by Sarvam. The scholarship demonstration shows how an unresolved income-document requirement becomes a documented application field.

**Our contribution is an application-preparation workflow that connects language understanding, documentary evidence, explicit checks and a usable output.**

> **Project status:** Hackathon prototype with resettable scholarship scenarios, a React/FastAPI implementation, Sarvam service integrations and a printable application export. The demonstration programme and applicant records are synthetic. Implementation details and remaining integration work are documented below.

## The problem

An application is a sequence of dependent decisions:

1. What does the institution require?
2. Which conditions apply to this applicant?
3. What evidence establishes each condition?
4. Is anything missing or inconsistent?
5. What should the applicant do next?
6. Which values belong in the application?

These decisions can become difficult when requirements use formal language, records are scattered across documents, or applicants are more comfortable explaining their situation aloud.

An incomplete application may require corrections, additional assistance or another visit to an office. An inconsistent application can create uncertainty for both the applicant and the reviewer.

Aavedan focuses on the preparation stage: making requirements understandable and the evidence behind an application visible.

### Who the project is designed to help

| User | Preparation challenge | Intended value |
|---|---|---|
| Students and families | Understanding scholarship conditions and assembling records | Clear requirements and actionable guidance |
| Applicants who prefer Hindi or spoken interaction | Navigating formal written instructions | Spoken explanations and voice clarification |
| Campus helpdesks and assistance centres | Repeatedly explaining missing documents | A shared view of requirements, evidence and draft fields |
| Application reviewers | Understanding where an entered value came from | Document names, page references and supporting excerpts |

These are intended users, not claims of existing deployments or measured adoption.

## What the prototype demonstrates

- A three-panel workspace connecting **Requirements**, **Evidence Inspector** and **Application Draft**.
- An interactive **Voice Doubt Assistant** powered by Sarvam-105B and Bulbul TTS with Hindi/English voice dialogue.
- Resettable cases for incomplete, complete, non-qualifying and conflicting-identity situations.
- Source-reference structures containing document identity, page number, excerpt and evidence type.
- A distinction between applicant statements and documentary evidence.
- A deterministic evaluator for supported conditions.
- Sarvam-powered structured extraction and bilingual speech integrations.
- SQLite persistence operations and an audit-event trail.
- A printable application packet with checklist and pending signature.

The central product interaction is a change in application state: supplying the missing income-certificate example updates the relevant requirement, evidence reference and draft field.

## Sarvam at the core

Sarvam provides the language and speech capabilities around which Aavedan's architecture is organised. The project separates these capabilities from explicit application checks so that extracted information can be inspected and the rule logic remains understandable.

| Sarvam component | Responsibility | Repository implementation |
|---|---|---|
| **Sarvam-105B family** | Convert document text into structured applicant facts | The provider requests JSON containing fields such as applicant name, institution, academic year and annual household income |
| **Bulbul TTS** | Explain the current blocker or preparation status aloud | Hindi/English text-to-speech calls return audio for browser playback |
| **Saaras STT** | Convert a recorded clarification into text | The backend provides an audio-transcription endpoint |
| **Sarvam Vision / Document AI** | Convert scanned documents into text for downstream interpretation | A provider helper implements submission, polling and caching; its connection to the primary UI workflow remains integration work |

The provider is located in [backend/app/sarvam_provider.py](backend/app/sarvam_provider.py). Configuration is centralised in [backend/app/config.py](backend/app/config.py).

### Why this architecture is useful

**Document reading and interpretation are separate responsibilities.** Vision is the document-reading component; 105B interprets text as structured fields. This allows document extraction and application reasoning to be examined separately.

**Speech participates in the workflow.** Bulbul can communicate the next required action. Saaras provides the interface for an applicant who prefers to explain a clarification aloud.

**Explicit checks remain in application code.** The evaluator compares values and evidence types against supported conditions. Natural-language generation does not need to calculate an income threshold or decide whether a statement counts as a certificate.

**The same evidence can inform several views.** A document reference can explain a requirement, support an application field and appear in the exported checklist.

Sarvam's contribution is therefore central to the intended experience: reading and understanding Indian-language material, extracting structured facts, and communicating the next step through speech.

## Architecture

The repository contains a React frontend and a modular FastAPI backend, alongside earlier root-level application variants. The setup below targets the modular backend and React frontend.

### Component responsibilities

| Component | Responsibility | Source |
|---|---|---|
| Frontend workspace | Requirements, evidence, application preview and user interactions | [frontend/src/App.tsx](frontend/src/App.tsx) |
| Backend API | Case state, scenarios, clarification, speech and export | [backend/app/main.py](backend/app/main.py) |
| Sarvam provider | Model calls and document-processing helper | [backend/app/sarvam_provider.py](backend/app/sarvam_provider.py) |
| Data models | Typed case state, citations, evidence types and checks | [backend/app/models.py](backend/app/models.py) |
| Rule evaluator | Supported comparisons and evidence-sensitive outcomes | [backend/app/evaluator.py](backend/app/evaluator.py) |
| Persistence | SQLite case state, events and document caching | [backend/app/database.py](backend/app/database.py) |
| Demonstration data | Resettable applicant cases and sample source text | [backend/app/synthetic_data.py](backend/app/synthetic_data.py) |
| Export generator | Printable application packet | [backend/app/export_generator.py](backend/app/export_generator.py) |

### Application state and evidence

The models distinguish facts supported by documentary evidence from statements supplied by an applicant. Source citations carry a document name, page and excerpt.

For example:

| Information | Interpretation |
|---|---|
| “Our annual income is ₹1.8 lakh,” supplied as a clarification | An applicant statement |
| Income stated in the supplied certificate example | A document-supported value |
| A certificate referenced but not supplied | Missing documentary evidence |
| Different names in relevant records | A conflict requiring review |

Document-supported means supported by the supplied record. It does **not** mean the issuing authority has authenticated that record.

### Rule evaluation

The evaluator supports conditions including numeric thresholds, equality and required documents. Its tests cover distinctions such as:

- Marks satisfying a minimum percentage.
- Income satisfying or exceeding a ceiling.
- A user statement remaining insufficient for a documentary requirement.
- Conflicting names requiring review.

The evaluator and the scenario API are distinct parts of the prototype. Some demonstration transitions currently update check states directly; they should not be interpreted as proof that arbitrary uploaded documents have passed a complete evaluation pipeline.

## Demonstration workflow

### Demonstration programme

The interface uses **Udaan Education Grant — Demonstration Programme**, with a sample award of **₹25,000** and an illustrative annual-income ceiling of **₹2,50,000**.

This programme is fictional. Its rules are demonstration conditions, not statutory requirements or a real scholarship offer.

### Available cases

| Case | What to inspect | Demonstration outcome |
|---|---|---|
| Asha Sharma — incomplete | Academic/enrollment information and the missing income certificate | The certificate requirement remains unresolved |
| Asha Sharma — complete | Document-supported income and populated draft fields | A draft ready for applicant review |
| Rohan Mehta — condition not met | Sample income of ₹3,20,000 against the ₹2,50,000 ceiling | The income condition is not met |
| Conflicting names | Different names across demonstration records | Review is required |

### The central interaction

1. Open the incomplete Asha Sharma case.
2. Inspect the income requirement and its evidence reference.
3. Record a clarification or request spoken guidance.
4. Use the sample income-certificate action.
5. Observe the requirement, evidence reference and income field update together.
6. Open the printable application packet.
7. Review the checklist and pending signature.

In the current implementation, the sample-certificate action supplies predefined certificate text. In live mode, it can request income extraction through Sarvam; the surrounding resolution flow still includes preset values and direct state updates. It is a controlled demonstration rather than a general-purpose certificate-verification service.

### A 90-second presentation

| Time | Action | Point to communicate |
|---|---|---|
| 0–15 seconds | Open the three-panel workspace | Applications require connected decisions about rules, evidence and fields |
| 15–30 seconds | Select the missing income requirement | Knowing a value is different from supplying the required proof |
| 30–45 seconds | Play Hindi guidance | Sarvam makes the next action accessible through speech |
| 45–65 seconds | Supply the sample certificate | Requirements, evidence and the draft update together |
| 65–80 seconds | Open the printable packet | The workflow produces a concrete preparation output |
| 80–90 seconds | Switch to a condition-failure or identity-conflict case | Different problems require different outcomes |

When presenting the project, state which mode is active and which actions make live API calls.

## Operating modes

### Fixture mode

Fixture mode loads predefined scenarios and citations for a reproducible demonstration. It is useful for inspecting the interface and the evidence distinctions without depending on extraction results.

Fixture mode does not necessarily make the application fully offline: the current speech actions can still call Bulbul when a key is configured.

### Live mode

The code contains live Sarvam calls for structured extraction, speech synthesis and transcription. API access depends on the configured key, account permissions and service availability.

A live-mode label alone does not establish that every value displayed was extracted live. The current sample-resolution path includes preset values and fallbacks. The Vision helper is not connected to a general upload route in the modular backend's primary API.

These boundaries are important when reproducing or evaluating the demonstration.

## Run locally

### Prerequisites

- Python 3.10 or later.
- Node.js and npm compatible with the versions declared in [frontend/package.json](frontend/package.json).
- A Sarvam API key for live model calls.
- Two terminals for backend and frontend development.

### 1. Clone the repository

    git clone https://github.com/HarshC2006/Sarvam_Ai_Final_Submission.git
    cd Sarvam_Ai_Final_Submission

### 2. Create a Python environment

Windows PowerShell:

    python -m venv .venv
    .\.venv\Scripts\Activate.ps1

Linux or macOS:

    python3 -m venv .venv
    source .venv/bin/activate

Install backend dependencies:

    python -m pip install fastapi uvicorn pydantic sarvamai httpx python-multipart pytest

### 3. Configure Sarvam

Create a plain-text file named backend/.env:

    SARVAM_API_KEY=your_key_here
    SARVAM_CHAT_MODEL=sarvam-105b-conversations
    SARVAM_STT_MODEL=saaras:v4
    SARVAM_TTS_MODEL=bulbul:v3
    SARVAM_TTS_SPEAKER=shubh

The modular backend loads backend/.env, falling back to a root .env file. Existing process environment variables take precedence.

The current provider selects shubh for Hindi and aditya for English inside its speech method; changing the speaker environment setting alone does not currently override that selection.

Keep actual keys out of commits, screenshots and shared logs.

### 4. Start the backend

From the repository root, with the environment active:

    cd backend
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

Useful endpoints:

- API documentation: http://127.0.0.1:8000/docs
- Health response: http://127.0.0.1:8000/api/health
- Current state: http://127.0.0.1:8000/api/state

### 5. Start the frontend

In another terminal, from the repository root:

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173. The Vite configuration proxies /api requests to the backend on port 8000.

### 6. Build the frontend

    cd frontend
    npm run build

The modular backend includes static-serving support when frontend/dist exists. Restart the backend after creating the build, then open http://127.0.0.1:8000.

## API reference

The modular backend exposes:

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Report configuration and selected provider checks |
| GET | /api/state | Return the active case |
| POST | /api/set-mode | Select fixture or live mode |
| POST | /api/set-language | Select Hindi or English |
| POST | /api/load-scenario/{scenario_key} | Load a supported demonstration case |
| POST | /api/resolve-blocker | Supply the sample income-certificate example |
| POST | /api/clarify | Record an applicant statement |
| POST | /api/speak-advice | Request spoken guidance |
| POST | /api/voice-doubt | Interactive voice doubt assistant powered by Bulbul TTS and Sarvam-105B |
| POST | /api/voice-input | Request transcription of supplied audio |
| POST | /api/upload-document | Upload applicant document for Doc AI extraction |
| GET | /api/export | Return a printable HTML application packet |

The export is **HTML formatted for printing**. Use the browser's Print → Save as PDF action to obtain a PDF; the endpoint does not directly generate a PDF binary.

## Testing and validation

Evaluator tests are included in [backend/tests/test_evaluator.py](backend/tests/test_evaluator.py).

From the backend directory:

    python -m pytest tests/test_evaluator.py -v

The tests address academic thresholds, income comparisons, the insufficiency of self-reported income and conflicting names. They validate evaluator behaviour separately from the API's scenario transitions.

Frontend checks:

    cd frontend
    npm run build
    npm run lint

### Recommended demonstration checks

- Load each scenario and inspect its intended outcome.
- Record a clarification and confirm it remains a statement.
- Resolve the sample blocker and inspect all three panels.
- Play guidance in Hindi and English.
- Open the export and inspect the checklist and signature area.
- Repeat live requests and inspect actual provider responses.

No independently measured accuracy, latency, production adoption or live integration pass rate is asserted in this README. Run commands and report observed results for the environment being evaluated.

### Health-check interpretation

The current health implementation performs chat and TTS requests. Its STT and Document AI flags are inferred from key presence, so those flags are **configuration indicators, not successful end-to-end tests**. The chat probe also checks response presence rather than validating substantive extraction output.

Repeated health requests may trigger additional API usage.

## Current scope and next steps

The prototype establishes a clear product workflow and a Sarvam-centred integration structure. The next engineering steps are specific:

1. **Complete document ingestion:** connect uploads to Vision extraction and validate downloaded result formats.
2. **Unify evaluation:** route all extracted facts, including the sample-certificate path, through the evaluator before updating readiness.
3. **Make failures explicit:** replace default income values and sample transcription fallbacks with clear error/retry states in live mode.
4. **Strengthen provenance:** distinguish live extraction, fixture data, cached output and user corrections at field level.
5. **Test capabilities independently:** exercise Vision and STT with actual inputs instead of deriving readiness from key presence.
6. **Improve session isolation:** replace the process-wide active case with explicitly scoped sessions.
7. **Harden deployment:** review authentication, CORS, upload limits, retention and access controls before processing real applicant records in a public service.
8. **Expand supported processes:** add reviewed programme rules and form mappings after the first complete live workflow is validated.

The current API saves state and events to SQLite, but it uses a process-wide active case and initialises a demonstration case on startup. Persistence helpers alone do not establish isolated multi-user sessions or automatic recovery of the last active case.

## Broader applicability

The same product structure can support other document-driven preparation tasks:

| Potential extension | Reusable preparation pattern |
|---|---|
| Admissions | Conditions, records, discrepancies and form fields |
| Educational assistance | Applicant evidence linked to funding requirements |
| Certificate requests | Required attachments and outstanding information |
| Helpdesk support | A shared checklist and explanation of the next action |

These are extension opportunities, not implemented integrations.

## Team

**Namya Sheth · Harsh Chandwani**

Built for the Sarvam Campus application-building context.

## References

- [Sarvam AI](https://www.sarvam.ai/)
- [Document AI documentation](https://docs.sarvam.ai/api/api-guides-tutorials/document-intelligence/overview)
- [Chat completion documentation](https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview)
- [Bulbul text-to-speech](https://docs.sarvam.ai/api-reference/text-to-speech/convert)
- [Saaras speech-to-text](https://docs.sarvam.ai/api-reference/speech-to-text/transcribe)

---

**Aavedan explores a practical use of AI for access: connecting a person's documents, the requirements they must satisfy and the next step they can take—with Sarvam providing the language and speech capabilities at the centre of that experience.**

