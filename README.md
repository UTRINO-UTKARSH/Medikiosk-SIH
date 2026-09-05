# 🏥 Parchi — Intelligent Clinical Intake & Triage Engine

> **From a paper parchi to an intelligent digital clinical handoff.**

**Parchi (पर्ची)** is an **API-first, multimodal clinical intake and early-triage platform** designed to reduce congestion, documentation burden, and language barriers in high-volume **Outpatient Departments (OPDs), Community Health Centres (CHCs), and rural Primary Health Centres (PHCs)**.

Built for the **Smart India Hackathon (SIH)**, Parchi transforms the traditional patient intake slip into a structured digital pipeline that collects patient information through **voice, touch, and assisted interaction**, performs rule-based red-flag triage, generates an AI-assisted clinical summary, and delivers a concise handoff to the examining doctor through a **PDF and dynamic QR code**.

> ⚠️ **Clinical Safety Notice:** Parchi is an assistive intake and early-triage system. It does **not** provide independent final diagnoses or prescribe medications. All clinical decisions remain with qualified healthcare professionals.

---

## 🚨 The Problem

High-volume public healthcare facilities frequently face severe congestion during peak OPD hours.

A typical patient journey can involve:

```text
Patient arrives
     ↓
Registration queue
     ↓
Manual form filling
     ↓
History collection
     ↓
Waiting for doctor
     ↓
Doctor repeats basic questions
     ↓
Consultation
```

This creates several interconnected problems:

* ⏳ Long registration and consultation queues
* 📝 Repetitive manual documentation
* 👨‍⚕️ High clinical documentation workload
* 🚨 Emergency patients potentially remaining buried in routine queues
* 🗣️ Regional-language and literacy barriers
* 📄 Fragmented medical records
* 🌐 Dependence on internet connectivity
* 🏥 Difficulty integrating with existing hospital workflows

Parchi addresses these problems **before the patient reaches the doctor**.

---

# 💡 Our Approach

Parchi turns:

> **Patient information → Structured intake → Early triage → Clinical summary → Doctor handoff**

into a single digital workflow.

Instead of making the doctor spend the first several minutes collecting basic history, Parchi prepares the information beforehand.

### Core workflow

```text
Patient / ASHA Worker
        │
        ▼
Voice / Touch / Assisted Intake
        │
        ▼
Speech-to-Text
        │
        ▼
Structured Clinical Interview
        │
        ├───────────────┐
        ▼               ▼
History Extraction   Red-Flag Detection
        │               │
        │          Emergency / Urgent /
        │             Routine
        │               │
        └───────┬───────┘
                ▼
        AI Clinical Summary
                │
                ▼
       PDF + Dynamic QR Code
                │
                ▼
             Doctor
                │
                ▼
       Informed Consultation
```

---

# ✨ Key Features

## 🎙️ 1. Voice-First Multimodal Intake

Patients can describe their complaints naturally instead of typing medical terminology.

Parchi supports:

* Voice input
* Touch-based interaction
* Text input
* Assisted intake through ASHA workers / volunteers

Speech recognition is powered by:

**Whisper Large V3**

The system is designed for conversational input in:

* 🇮🇳 Hindi
* 🇮🇳 Marathi
* 🇬🇧 English

---

## 🌐 2. Vernacular-Friendly Interface

The frontend uses `react-i18next` to provide real-time language switching.

This allows the same workflow to operate across different linguistic environments without requiring patients to understand formal medical English.

### Design principles

* Large touch targets
* Minimal typing
* Simple questions
* Voice-first interaction
* Local-language support
* Kiosk-friendly interface

---

# 🧠 3. Deterministic Clinical Intake Engine

Parchi does **not** rely on an open-ended chatbot to conduct the entire medical interview.

Instead, the intake workflow is controlled by a **deterministic finite-state machine (FSM)**.

### Standard 5-step history collection

```text
1. Chief Complaint
        ↓
2. Symptom Onset
        ↓
3. Severity
        ↓
4. Chronological Progression
        ↓
5. Past Medical History
```

This provides:

* Predictable conversation flow
* Consistent data collection
* Reduced hallucination risk
* Easier validation
* Better structured outputs
* Greater clinical controllability

The LLM operates **inside a controlled workflow**, rather than controlling the workflow itself.

---

# 🚨 4. Continuous Red-Flag Triage

While the patient interacts with Parchi, the system continuously evaluates the collected information for potentially serious acute warning signs.

Examples include:

* Severe breathing difficulty
* Potential cardiac warning signs
* Neurological deficits
* Other potentially life-threatening symptoms

Patients are assigned a priority category:

| Priority         | Meaning                                      |
| ---------------- | -------------------------------------------- |
| 🔴 **Emergency** | Immediate clinical attention may be required |
| 🟠 **Urgent**    | Requires prioritized evaluation              |
| 🟢 **Routine**   | Can follow the normal OPD workflow           |

> Parchi's triage output is a **priority signal, not a diagnosis**.

The final decision always belongs to the healthcare professional.

---

# 🌿 5. AYUSH / Ayurvedic Intake

Parchi can also support AYUSH healthcare workflows by collecting specialized constitutional and lifestyle parameters.

These include:

* **Prakriti**
* **Agni**
* **Koshtha**
* **Ahara-Vihara**

The objective is to digitize and accelerate routine constitutional assessment while preserving structured clinical documentation.

---

# 🤖 6. AI-Assisted Clinical Summarization

After structured intake, Parchi generates a concise clinical handoff.

The AI layer is designed to produce **strictly structured JSON**, rather than unrestricted conversational output.

### Example conceptual output

```json
{
  "chiefComplaint": "...",
  "onset": "...",
  "severity": "...",
  "progression": "...",
  "pastHistory": [],
  "redFlags": [],
  "priority": "ROUTINE",
  "summary": "..."
}
```

This structured approach makes the output easier to:

* Validate
* Store
* Display
* Convert to PDF
* Send through APIs
* Integrate with hospital systems

---

# ⚡ 7. High-Speed Cloud Inference

The primary cloud inference pipeline uses:

```text
Patient Voice
     ↓
Whisper Large V3
     ↓
Groq LPU
     ↓
Llama 3.1 8B Instant
     ↓
Structured Clinical Output
```

Groq's low-latency inference is used to keep the patient interaction responsive during high-volume intake.

---

# 📴 8. Offline Edge Failover

Healthcare workflows cannot simply stop because a rural facility temporarily loses internet connectivity.

Parchi therefore follows a **cloud-first + edge-fallback architecture**.

```text
                ┌───────────────┐
                │ Patient Input │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Connectivity? │
                └───────┬───────┘
                    YES │   │ NO
                        │   │
              ┌─────────▼┐ ┌▼──────────────┐
              │   Groq   │ │ Local Server  │
              │  Cloud   │ │    Ollama     │
              └────┬─────┘ │    + Qwen     │
                   │       └───────┬───────┘
                   │               │
                   └───────┬───────┘
                           ▼
                  Structured Output
```

When cloud connectivity is unavailable, inference can fall back to an **on-premise local server running quantized models through Ollama**, such as Qwen-based models.

This allows the core intake and triage workflow to continue during network disruptions.

---

# 🔐 9. Patient Authentication & Privacy

Parchi is designed around a **patient-first, zero-trust approach**.

The authentication workflow uses two layers:

### Layer 1 — Mobile OTP

A one-time password is sent to the patient's registered mobile number.

### Layer 2 — Patient Security PIN

The patient additionally controls a personal security PIN.

This two-layer approach helps protect medical information on shared hospital/kiosk environments.

OTP delivery is handled through **Brevo**.

---

# 📄 10. Digital Clinical Handoff

One of Parchi's primary outputs is a standardized clinical handoff document.

Instead of giving the doctor an entire conversation, Parchi produces a concise summary containing relevant information such as:

* Chief complaint
* Symptom history
* Timeline
* Severity
* Relevant medical history
* Red flags
* Triage priority
* Relevant patient records

The summary can be generated as a PDF using `pdfkit`.

---

# 🔗 11. Dynamic QR Handoff

Each clinical intake can generate a dynamic QR code.

```text
Patient completes intake
        ↓
Clinical summary generated
        ↓
PDF / clinical record created
        ↓
Dynamic QR generated
        ↓
Doctor scans QR
        ↓
Doctor reviews summary
```

This allows the doctor to access the patient's prepared information **before or during the consultation**.

The objective is to reduce repetitive history-taking and improve consultation efficiency.

---

# 🏥 12. Hospital & Kiosk Workflow

Parchi is designed to work at the hospital entry point.

A simplified deployment can look like:

```text
┌─────────────────────────────┐
│       Hospital Entrance     │
│                             │
│   ┌─────────┐  ┌─────────┐  │
│   │ Kiosk 1 │  │ Kiosk 2 │  │
│   └────┬────┘  └────┬────┘  │
│        │             │       │
│        └──────┬──────┘       │
│               ▼              │
│         PARCHI SERVER        │
│               │              │
│        ┌──────┴──────┐       │
│        ▼             ▼       │
│     Triage       Clinical    │
│     Queue        Summary     │
│                         │    │
│                         ▼    │
│                      Doctor  │
└─────────────────────────────┘
```

Parchi can support both:

### Self-Service Mode

The patient interacts directly with the kiosk.

### Assisted Mode

An ASHA worker, volunteer, or hospital staff member assists the patient.

This is particularly useful for elderly, low-literacy, or physically constrained patients.

---

# 🗂️ 13. Patient Medical History

The patient portal provides structured access to their healthcare information.

Planned/implemented capabilities include:

* Hospital metadata
* OPD schedules
* AI-generated summaries
* Uploaded diagnostic reports
* Medical history
* Previous clinical summaries
* Downloadable records

The **Medical History** interface allows patients to verify and retrieve previously generated summaries and uploaded diagnostic documents.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │      PATIENT      │
                         └─────────┬─────────┘
                                   │
                     Voice / Touch / Text
                                   │
                                   ▼
                    ┌────────────────────────┐
                    │    React + Vite UI     │
                    │    Tailwind CSS        │
                    │    react-i18next       │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Speech Recognition      │
                    │ Whisper Large V3        │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Clinical Intake FSM     │
                    │ Deterministic Workflow  │
                    └────────────┬───────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 ▼                                ▼
       ┌──────────────────┐             ┌──────────────────┐
       │ Red-Flag Engine  │             │ AI Processing    │
       │                  │             │                  │
       │ Emergency        │             │ Groq             │
       │ Urgent           │             │ Llama 3.1 8B     │
       │ Routine          │             │                  │
       └─────────┬────────┘             └────────┬─────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │ Structured JSON        │
                    │ Clinical Summary       │
                    └────────────┬───────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
             MongoDB         PDFKit       Dynamic QR
             Atlas
                  │              │              │
                  └──────────────┼──────────────┘
                                 ▼
                         ┌──────────────┐
                         │    DOCTOR    │
                         └──────────────┘

                    INTERNET FAILURE
                           │
                           ▼
                    Local Edge Server
                           │
                         Ollama
                           │
                         Qwen
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose                |
| ----------------- | ---------------------- |
| **React**         | User interface         |
| **Vite**          | Frontend build tooling |
| **Tailwind CSS**  | UI styling             |
| **React Router**  | Client-side navigation |
| **react-i18next** | Multilingual interface |
| **Lucide React**  | UI icons               |

## Backend

| Technology        | Purpose                  |
| ----------------- | ------------------------ |
| **Node.js**       | Backend runtime          |
| **Express.js**    | REST API framework       |
| **MongoDB Atlas** | Database                 |
| **PDFKit**        | Clinical PDF generation  |
| **QR generation** | Digital clinical handoff |

## AI / ML

| Technology               | Purpose                     |
| ------------------------ | --------------------------- |
| **Whisper Large V3**     | Speech recognition          |
| **Groq**                 | Low-latency cloud inference |
| **Llama 3.1 8B Instant** | Cloud LLM                   |
| **Ollama**               | Local inference runtime     |
| **Qwen**                 | Offline/edge LLM            |

## Authentication & Communication

| Technology      | Purpose                  |
| --------------- | ------------------------ |
| **Brevo**       | OTP delivery             |
| **Mobile OTP**  | Identity verification    |
| **Patient PIN** | Secondary authentication |

---

# 🔄 AI Processing Pipeline

Parchi intentionally separates **workflow control**, **triage**, and **language-model intelligence**.

```text
Raw Patient Input
       │
       ▼
Speech-to-Text
       │
       ▼
Normalized Text
       │
       ▼
FSM-controlled Questions
       │
       ▼
Structured Patient Information
       │
       ├──────────────► Rule-Based Red Flag Engine
       │
       ▼
LLM Processing
       │
       ▼
Schema-Constrained JSON
       │
       ▼
Validation
       │
       ▼
Clinical Summary
```

This architecture minimizes unnecessary LLM autonomy and provides greater predictability than a conventional chatbot architecture.

---

# 🧠 Why a Deterministic FSM + LLM?

A completely autonomous medical chatbot introduces unnecessary uncertainty.

Parchi instead assigns different responsibilities to different components.

| Component            | Responsibility                                  |
| -------------------- | ----------------------------------------------- |
| **FSM**              | Controls what questions are asked               |
| **Speech Model**     | Converts speech into text                       |
| **Red-Flag Engine**  | Identifies predefined danger signals            |
| **LLM**              | Extracts, organizes, and summarizes information |
| **Validation Layer** | Ensures structured output                       |
| **Doctor**           | Makes the final clinical decision               |

This separation improves:

* Reliability
* Explainability
* Testing
* Safety
* Predictability
* Maintainability

---

# 🔒 Clinical Safety Philosophy

Parchi follows a strict **human-in-the-loop** model.

### Parchi CAN:

* Collect patient information
* Structure medical history
* Summarize patient-provided information
* Highlight potential red flags
* Assign preliminary priority categories
* Prepare clinical handoff documentation

### Parchi DOES NOT:

* Make an independent final diagnosis
* Replace a physician
* Prescribe medication autonomously
* Make definitive treatment decisions
* Override clinical judgment

The system exists to **reduce information and documentation friction**, not replace healthcare professionals.

---

# 📊 Economic & Operational Vision

Parchi is designed around a low-cost cloud-and-edge architecture suitable for public healthcare environments.

The target is to reduce dependence on:

* Paper registration slips
* Manual documentation
* Physical record storage
* Repetitive intake work
* Large-scale manual registration processes

The project's estimated operational economics target approximately:

| Environment                     | Estimated Intake Cost |
| ------------------------------- | --------------------: |
| Rural PHC / CHC                 |           ₹0.30–₹0.32 |
| High-capacity district hospital |                ~₹1.05 |

Traditional paper-based processes can incur substantially higher per-patient operational costs.

> **Note:** These figures should be treated as project estimates/benchmarks unless independently validated through deployment data.

---

# 🎯 Expected Impact

Parchi aims to improve the OPD experience for both sides of the healthcare interaction.

### For Patients

* Reduced waiting
* Easier registration
* Voice-first interaction
* Vernacular support
* Better accessibility
* Faster emergency identification
* Digital access to records

### For Doctors

* Pre-consultation patient summary
* Less repetitive questioning
* Reduced documentation workload
* Structured medical history
* Faster patient understanding
* Immediate visibility of potential red flags

### For Hospitals

* Reduced registration congestion
* Digital records
* Standardized intake
* Reduced paper dependency
* Better patient flow
* Scalable infrastructure

---

# 🌐 Deployment Model

Parchi is designed for deployment across:

### 🏥 District Hospitals

High-volume centralized intake with multiple kiosks.

### 🏨 CHCs

Assisted intake with local staff and cloud/edge inference.

### 🏡 PHCs

Offline-capable local deployments for areas with unreliable connectivity.

### 🌿 AYUSH Facilities

Specialized constitutional and lifestyle intake workflows.

---

# 📁 Project Structure

A representative project structure:

```text
Parchi/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── ai/
│   ├── prompts/
│   ├── schemas/
│   ├── triage/
│   └── ...
│
├── docs/
│   ├── architecture/
│   └── ...
│
└── README.md
```

> The exact structure may differ depending on the current implementation.

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB / MongoDB Atlas account
* Git
* Ollama (for local inference)
* Required API credentials

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Parchi
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GROQ_API_KEY=your_groq_api_key

BREVO_API_KEY=your_brevo_api_key

JWT_SECRET=your_jwt_secret
```

Never commit secrets or `.env` files to GitHub.

---

# ▶️ Running Locally

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will communicate with the local Express API.

---

# 📴 Running the Local AI Fallback

Install Ollama and pull the required local model.

Example:

```bash
ollama pull qwen2.5:3b
```

Then start the Ollama service.

The backend can use the local model when cloud inference is unavailable.

---

# 🔌 API-First Architecture

Parchi is designed as an **API-first system**, allowing the clinical intake engine to be integrated with different hospital interfaces.

Conceptual API groups include:

```text
/api/auth
/api/patients
/api/hospitals
/api/intake
/api/triage
/api/summaries
/api/records
/api/qr
/api/opd
```

This separation allows the same backend intelligence to serve:

* Kiosks
* Patient portals
* Hospital dashboards
* Doctor interfaces
* Assisted intake applications
* Future mobile applications

---

# 🔮 Future Roadmap

Potential future improvements include:

* [ ] Full offline-first synchronization
* [ ] More Indian regional languages
* [ ] Advanced hospital queue management
* [ ] Doctor dashboard
* [ ] Real-time OPD analytics
* [ ] FHIR-compatible interoperability
* [ ] Integration with existing hospital information systems
* [ ] More robust edge deployment
* [ ] Multi-kiosk synchronization
* [ ] Automated record classification
* [ ] Enhanced accessibility for elderly patients
* [ ] Deployment pilots at PHCs/CHCs
* [ ] Clinical validation of triage workflows
* [ ] Comprehensive audit and monitoring infrastructure

---

# 🏆 Smart India Hackathon

Parchi is developed as a **Smart India Hackathon project** with a focus on applying AI/ML to real-world public healthcare infrastructure.

The project combines:

> **AI + Multimodal Interaction + Healthcare + Edge Computing + Vernacular Accessibility + Digital Public Infrastructure**

Rather than attempting to replace doctors with AI, Parchi focuses on a more practical problem:

> **How can we make the doctor receive the right information, in the right format, before the consultation begins?**

---

# 👥 Intended Users

### Primary Users

* Patients
* Doctors
* Hospital registration staff
* ASHA workers
* Healthcare volunteers

### Deployment Environments

* PHCs
* CHCs
* District hospitals
* Government hospitals
* AYUSH healthcare facilities
* High-volume OPDs

---

# ⚠️ Disclaimer

Parchi is a **clinical intake, documentation, and early-triage assistance platform**.

It is not intended to:

* Replace qualified healthcare professionals
* Provide definitive medical diagnoses
* Prescribe medications
* Make autonomous treatment decisions

All AI-generated information should be reviewed by an appropriately qualified healthcare professional before being used for clinical decision-making.

---

# 📜 Privacy & Data Protection

Parchi is designed with patient privacy as a core architectural requirement.

The platform aims to align its data handling practices with India's **Digital Personal Data Protection (DPDP) framework**, including principles around:

* Purpose limitation
* Patient data protection
* Controlled access
* Authentication
* Auditability
* Secure data handling

Production deployment should undergo appropriate legal, security, clinical, and compliance review before handling real patient data.

---

# 🚀 Vision

Healthcare infrastructure should not make patients wait hours simply to explain what is wrong with them.

Parchi's vision is simple:

> **Let the patient speak. Let the system structure. Let the doctor decide.**

By converting an ordinary **पर्ची** into an intelligent digital clinical handoff, Parchi aims to make high-volume healthcare **faster, more accessible, more resilient, and more human-centered.**

---

## Made for 🇮🇳 India

**Parchi — Intelligent Clinical Intake & Triage**

`Patient → Parchi → Doctor`

**Less waiting. Less paperwork. Better information.**
