const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const connectDb = require("./lib/db.js");
const Record = require('./models/recordModelTemp.js');
const app = express();
const port = process.env.PORT || 3001;
const pdfParseModule = require('pdf-parse');
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
].filter(Boolean);

const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// --- Deps ---
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Middleware & Auth Layer (UNTOUCHED) ---
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(cookieParser());

// User/Auth routes remain exactly as they were
const userRoutes = require('./routes/routes.js');
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send("Parchi API is running");
});

// --- Memory-Safe File Storage System ---
const TEMP_DIR = path.join(os.tmpdir(), 'parchi_summaries');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Auto-cleanup cron to prevent disk space exhaustion
setInterval(() => {
    fs.readdir(TEMP_DIR, (err, files) => {
        if (err) return;
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && (now - stats.mtimeMs > 24 * 60 * 60 * 1000)) {
                    fs.unlink(filePath, () => { }); // Delete files older than 24h
                }
            });
        });
    });
}, 60 * 60 * 1000);

function generateReferenceId() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `PCH-${yy}${mm}${dd}-${rand}`;
}

async function extractTextFromPdf(buffer) {
    // 1. Traditional v1 default function: pdf(buffer)
    if (typeof pdfParseModule === 'function') {
        const data = await pdfParseModule(buffer);
        return data.text || "";
    }
    // 2. Transpiled CommonJS default: pdf.default(buffer)
    if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        const data = await pdfParseModule.default(buffer);
        return data.text || "";
    }
    // 3. Modern v2 class API: new PDFParse({ data: buffer }).getText()
    const PDFClass = pdfParseModule.PDFParse || pdfParseModule;
    if (typeof PDFClass === 'function') {
        try {
            const parser = new PDFClass({ data: buffer });
            if (typeof parser.getText === 'function') {
                const result = await parser.getText();
                return result.text || "";
            }
        } catch (_) {
            // fallback if it was callable without new
            const data = await PDFClass(buffer);
            return data.text || "";
        }
    }
    throw new Error("Unable to initialize pdf-parse module.");
}

// --- NEW: HL7 FHIR R4 Bundle Generator ---
function buildFHIRBundle(data, referenceId) {
    return {
        resourceType: "Bundle",
        id: referenceId,
        type: "document",
        timestamp: new Date().toISOString(),
        entry: [
            {
                fullUrl: `urn:uuid:${crypto.randomUUID()}`,
                resource: {
                    resourceType: "Patient",
                    name: [{ text: data.patientName || "Unknown" }],
                    gender: data.sex ? data.sex.toLowerCase() : "unknown",
                    identifier: [
                        {
                            type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" }] },
                            value: referenceId
                        },
                        {
                            system: "https://ndhm.gov.in",
                            value: data.abhaId || "Not Provided"
                        }
                    ]
                }
            },
            {
                fullUrl: `urn:uuid:${crypto.randomUUID()}`,
                resource: {
                    resourceType: "Encounter",
                    status: "finished",
                    class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB", display: "ambulatory" },
                    priority: { text: data.triageLevel || "Routine" }
                }
            },
            {
                fullUrl: `urn:uuid:${crypto.randomUUID()}`,
                resource: {
                    resourceType: "ClinicalImpression",
                    status: "completed",
                    description: data.physicianSummary || "AI-generated intake summary.",
                    finding: (data.primarySymptoms || []).map(sym => ({
                        itemCodeableConcept: { text: sym }
                    }))
                }
            }
        ]
    };
}

// --- PDF Generation ---
function buildSummaryPdf(data, referenceId) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const NAVY = "#0a1a3f";
        const GRAY = "#555555";

        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text("PARCHI");
        doc.fillColor(GRAY).font("Helvetica-Bold").fontSize(11).text("AI-GENERATED HEALTH SUMMARY (AYUSH & ALLOPATHIC)");
        doc.moveDown(0.5);
        doc.strokeColor("#dddddd").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.8);

        const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        doc.fillColor("#000000").fontSize(10);
        doc.font("Helvetica-Bold").text("Patient  ", { continued: true })
            .font("Helvetica").text(data.patientName || "Not provided", { continued: true })
            .font("Helvetica-Bold").text("     Date  ", { continued: true })
            .font("Helvetica").text(dateStr);
        doc.font("Helvetica-Bold").text("Age / Sex  ", { continued: true })
            .font("Helvetica").text(`${data.age || "N/A"} / ${data.sex || "N/A"}`, { continued: true })
            .font("Helvetica-Bold").text("     Reference ID  ", { continued: true })
            .font("Helvetica").text(referenceId);
        doc.moveDown(1);

        const section = (title) => {
            doc.moveDown(0.6);
            doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(title);
            doc.moveDown(0.25);
            doc.fillColor("#000000").font("Helvetica").fontSize(10);
        };

        section("1. Presenting Concern (SOCRATES mapped)");
        doc.text(`Primary concern: ${(data.primarySymptoms && data.primarySymptoms.length) ? data.primarySymptoms.join(", ") : "Not specified"}`);
        if (data.symptomOnsetPattern) doc.text(`Onset / Pattern: ${data.symptomOnsetPattern}`);

        section("2. AYUSH Diagnostic Context (Dashavidha Pariksha)");
        doc.text(`Prakriti (Constitution) / Vikriti (Imbalance): ${data.prakriti || "Not assessed"} / ${data.vikriti || "Not assessed"}`);
        doc.text(`Agni (Digestive Fire) / Koshtha (Bowel Nature): ${data.agni || "Not assessed"} / ${data.koshtha || "Not assessed"}`);
        doc.text(`Ahara-Vihara (Diet & Lifestyle): ${data.aharaVihara || "Not assessed"}`);
        doc.text(`Nidana (Etiological Triggers): ${data.nidana || "Not identified"}`);
        doc.text(`Samprapti (Pathogenesis Pathway): ${data.samprapti || "Not formulated"}`);

        section("3. Relevant Medical History");
        doc.text(`Medical history: ${data.medicalHistory || "No major previous illness reported."}`);
        doc.text(`Known allergies: ${data.knownAllergies || "No known drug allergies reported."}`);
        doc.text(`Current medications: ${data.currentMedications || "Not provided."}`);

        section("4. Existing Records & Reports");
        const uploadedEntries = data.uploadedDocs && Object.keys(data.uploadedDocs).length ? Object.entries(data.uploadedDocs) : null;
        if (uploadedEntries) {
            uploadedEntries.forEach(([docType, fileName]) => doc.text(`${docType}:${fileName} — uploaded document detected.`));
        } else {
            doc.text("No supporting documents were uploaded by the patient.");
        }

        section("5. Triage & Doctor Review");
        if (data.triageLevel && data.triageLevel !== "Routine") {
            doc.fillColor("#b91c1c").font("Helvetica-Bold").text(`Triage flag: ${data.triageLevel}${data.triageReason ? " — " + data.triageReason : ""}`);
            doc.fillColor("#000000").font("Helvetica");
        }
        doc.text(data.physicianSummary || "This AI-generated summary is intended to support consultation.");

        doc.moveDown(1);
        doc.fontSize(8).fillColor("#888888").text("AI-generated • For informational and clinical-review support • Handle patient information securely", { align: "center" });

        doc.end();
    });
}

async function callGroqWithFallback(basePayload, modelsArray) {
    for (let i = 0; i < modelsArray.length; i++) {
        const currentModel = modelsArray[i];
        console.log(`[AI] Attempting with model (${i + 1}/${modelsArray.length}):${currentModel}`);

        // Inject the current model into the payload
        const payload = { ...basePayload, model: currentModel };

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // 1. Successful valid response
            if (response.ok && data.choices && data.choices[0]?.message?.content) {
                console.log(`[AI] Success using model: ${currentModel}`);
                return { response, data };
            }

            // 2. Groq specific JSON validation failure (salvage the text!)
            if (!response.ok && data.error?.code === "json_validate_failed" && data.error?.failed_generation) {
                console.log(`[AI] Salvaged JSON failure from: ${currentModel}`);
                return {
                    response: { ok: true },
                    data: {
                        choices: [{ message: { content: JSON.stringify({ currentMode: "Intake", chatReply: data.error.failed_generation }) } }]
                    }
                };
            }

            // 3. Any other API failure (e.g., rate limit, model offline)
            console.warn(`[AI] Model ${currentModel} failed:`, data.error?.message || "Unknown error");

        } catch (err) {
            // Network failures
            console.error(`[AI] Network error with model ${currentModel}:`, err.message);
        }
    }

    // If the loop finishes without returning, all models failed
    throw new Error("All fallback models failed.");
}

// --- REAL ENDPOINT: Document Upload & AI Extraction ---
app.post('/api/upload-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No document provided" });

        let extractedSummary = "";
        const mimeType = req.file.mimetype;

        // Helper function for safe LLM extraction with fallback
        async function runGroqExtractionWithFallback(messages, isVision = false) {
            // Define primary model based on type, with Qwen as the unified fallback
            const primaryModel = isVision ? "llama-3.2-11b-vision-preview" : "llama3-70b-8192";
            const fallbackModel = "qwen/qwen3.6-27b";

            try {
                // Attempt Primary Model
                const completion = await groq.chat.completions.create({
                    messages,
                    model: primaryModel,
                    temperature: 0.1,
                    ...(isVision ? { max_tokens: 300 } : {})
                });
                return completion.choices[0]?.message?.content?.trim();
            } catch (primaryErr) {
                console.warn(`[OCR Fallback] Primary model (${primaryModel}) failed. Switching to Qwen (${fallbackModel}). Error:`, primaryErr.message);

                try {
                    // Attempt Qwen Fallback Model
                    const fallbackCompletion = await groq.chat.completions.create({
                        messages,
                        model: fallbackModel,
                        temperature: 0.1,
                        ...(isVision ? { max_tokens: 300 } : {})
                    });
                    return fallbackCompletion.choices[0]?.message?.content?.trim();
                } catch (fallbackErr) {
                    console.error(`[OCR Fallback] Qwen fallback model also failed:`, fallbackErr.message);
                    throw fallbackErr;
                }
            }
        }

        // --- Handling Plain Text (.txt) or PDFs ---
        if (mimeType === 'text/plain' || mimeType === 'application/pdf') {
            let rawText = "";
            if (mimeType === 'application/pdf') {
                const extractedPdfText = await extractTextFromPdf(req.file.buffer);
                rawText = extractedPdfText.substring(0, 3000);
            } else {
                rawText = req.file.buffer.toString('utf-8').substring(0, 3000);
            }

            const messages = [
                { role: "system", content: "Extract key medical diagnoses, abnormal lab values, and medications from this text. Be concise." },
                { role: "user", content: rawText }
            ];

            const result = await runGroqExtractionWithFallback(messages, false);
            extractedSummary = result || "Extracted.";
        }
        // --- Handling Images (JPG, PNG) using Groq Vision ---
        else if (mimeType.startsWith('image/')) {
            const base64Image = req.file.buffer.toString('base64');
            const imageUrl = `data:${mimeType};base64,${base64Image}`;

            const messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "You are a medical scribe. Read this report/prescription. List the diagnoses, abnormal lab values, and prescribed medicines clearly and concisely." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }
            ];

            const result = await runGroqExtractionWithFallback(messages, true);
            extractedSummary = result || "Image processed.";
        } else {
            extractedSummary = "Unsupported file type.";
        }

        res.status(200).json({
            success: true,
            fileName: req.file.originalname,
            extractedSummary
        });

        // --- Persist the file + a Record so it shows up on the Download page ---
        // (fire-and-forget, after the response — doesn't block/slow down the upload)
        try {
            const jwt = require('jsonwebtoken');
            const token = req.cookies.jwt;
            if (!token) return;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const docId = crypto.randomUUID();
            const ext = path.extname(req.file.originalname) || '';
            const storedPath = path.join(TEMP_DIR, `document_${docId}${ext}`);
            fs.writeFileSync(storedPath, req.file.buffer);

            await Record.create({
                userId: decoded.userId,
                type: 'document',
                title: req.body.docType || req.file.originalname,
                fileUrl: `/api/document/${docId}${ext}`,
                docType: req.body.docType || null,
                fileName: req.file.originalname,
            });
        } catch (e) {
            console.log("Record Save Error (document):", e.message);
        }
    } catch (error) {
        console.error("SDK Upload Error:", error);
        res.status(500).json({ error: "Document processing failed" });
    }
});

// Serves an uploaded document back (e.g. from the Download page).
// Same ephemeral-storage caveat as /api/summary-pdf/:id — see TEMP_DIR notes.
app.get('/api/document/:filename', (req, res) => {
    const filePath = path.join(TEMP_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Document not found or expired.");
    }
    res.setHeader("Content-Disposition", `inline; filename="${req.params.filename}"`);
    fs.createReadStream(filePath).pipe(res);
});

// --- AI Chat Processing ---
app.post('/api/chat', async (req, res) => {
    try {
        const messages = req.body.messages;
        if (!Array.isArray(messages)) return res.status(400).json({ error: "Data format mismatch. Send 'messages' array." });
        const jwt = require('jsonwebtoken'); // Ensure this is imported at top of App.js
        const User = require('./models/userModel.js');
        const token = req.cookies.jwt;

        let patientMemory = "No previous records found. Ask the patient for their medical history.";

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);
                if (user && (user.medicalHistory || user.allergies || user.medications)) {
                    patientMemory = `
                    PREVIOUS MEDICAL RECORD ON FILE:
                    - Past Medical History: ${user.medicalHistory || "None documented"}
                    - Known Allergies: ${user.allergies || "None documented"}
                    - Past/Current Medications: ${user.medications || "None documented"}
                    
                    CRITICAL INSTRUCTION: Do NOT ask the patient to repeat their medical history if it is listed above. Acknowledge it gently (e.g. "I see from your records you have a history of...") and ask if anything has changed.
                    `;
                }
            } catch (e) { console.log("Chat LTM: No valid session"); }
        }
        const systemPrompt = {
            role: "system",
            content: `You are Parchi, a dual-mode clinical intake assistant acting as receptionist, nurse, and scribe for both Allopathic and AYUSH (Ayurveda) settings.

CRITICAL COMMUNICATION RULE: You must speak to the patient in simple, empathetic, everyday language. NEVER use technical Ayurvedic terms (such as Vata, Pitta, Kapha, Prakriti, Vikriti, Agni, Koshtha, Nidana, Samprapti, Ama) in your 'chatReply'. Patients will not understand them. Ask natural, relatable questions, and translate the patient's answers into structured Ayurvedic parameters behind the scenes in your JSON output.

Follow this flow strictly, one step at a time, asking only ONE focused question per turn:
1. Patient name, age, and sex (skip if already provided in the verified profile).
2. Chief complaint (Apply SOCRATES branching: politely explore Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/relieving factors, and Severity).
3. Nidana Exploration (Triggers & Causative Factors):
   - Ask what dietary habits, emotional stressors, seasonal changes, or daily routines immediately preceded or seem to trigger the symptoms (e.g., "Have you recently eaten very spicy/oily food, skipped meals, experienced heavy stress, or been exposed to unusual weather?").
4. Comprehensive AYUSH Context (Dashavidha Pariksha & Ahara-Vihara):
   - Prakriti (baseline constitution) vs. Vikriti (current doshic imbalance): ask simple inquiries about baseline body build, sensitivity to weather/temperatures (cold vs. heat), and how their body is behaving differently right now.
   - Agni (digestive fire & metabolism): ask about appetite consistency, bloating, heaviness after eating, or sour belching.
   - Koshtha (bowel tendency): ask about bowel regularity, stool consistency, and tendency toward constipation or looseness.
   - Ahara-Vihara (dietary & daily lifestyle patterns): ask about regular meal timings, sleep quality/duration, and daily physical activity levels.
5. Past medical history and known allergies.
6. Document request (see below).

STEP 6 — DOCUMENT REQUEST:
Once steps 1-5 are addressed, set currentMode to "DocumentRequest" (not Summary yet).
Based on the chief complaint, symptoms, history, and suspected system involvement, identify 2-4 SPECIFIC types of documents or reports that would be clinically useful (e.g., recent blood panel, imaging report, previous prescription).
In chatReply, clearly request these from the patient.
List the document types in the "requestedDocuments" array field.

HANDLING UPLOADS (CRITICAL RULE):
When the user uploads a file, you will automatically receive a message starting with "[Uploaded...".
1. Read the extracted clinical findings provided in that message, noting any flagged lab values or medication regimens.
2. If the user indicates they are finished (e.g., typing "here", "done", "that's all"), OR if they have uploaded the requested documents, YOU MUST IMMEDIATELY switch currentMode to "Summary".
3. Do NOT reject files based on their extension. Accept any uploaded clinical data. Do NOT get stuck in a loop demanding documents if the user indicates they are done.

STEP 7 — SUMMARY & SAMPRAPTI SYNTHESIS:
After the document step is resolved (files received or patient indicates they have none), switch currentMode to "Summary" and stop asking questions.

CRITICAL: When currentMode is "Summary", you MUST write a professional, high-yield physicianSummary — never leave it null or empty.
The physicianSummary must be a coherent 4-6 sentence clinical handoff synthesizing:
- Chief complaint with SOCRATES details.
- Integrated AYUSH formulation: Explicitly characterize the patient's Prakriti, Vikriti (active doshic vitiation), Agni state (Manda/Tikshna/Visham/Sama), and Koshtha.
- Nidana (identified dietary, behavioral, or environmental triggers) and Samprapti (preliminary pathogenesis/disease progression pathway connecting Nidana, Agni status, and manifesting symptoms).
- Past medical history, relevant current medications, and any significant investigation findings from uploaded records.
- Urgent red flags or triage prioritization if observed.
Always conclude the physicianSummary with this exact sentence: "This is an AI-generated preliminary summary intended to support consultation; final diagnosis and clinical decisions remain the responsibility of the treating physician."

TRIAGE / RED-FLAG DETECTION (runs continuously at every step):
Continuously monitor for high-risk red flags (e.g., crushing chest pain, acute dyspnea, neurological deficits, severe hemorrhaging, acute surgical abdomen, anaphylaxis, suicidal ideation).
Classify EVERY turn into one of these triage levels:
- "Emergency": one or more red flags are present — requires IMMEDIATE staff notification; cease routine questioning immediately.
- "Urgent": concerning findings requiring prompt attention, but not immediately life-threatening.
- "Routine": standard presentation without emergency features.

If triageLevel is "Emergency" at ANY point:
- Set currentMode to "Emergency".
- In chatReply, calmly inform the patient that staff have been alerted and instruct them to remain seated and await immediate assistance.
- Document the exact red-flag symptom(s) in "triageReason".
- Cease all regular intake questioning.
- If the patient provides further messages, update triageReason with any new worsening details and acknowledge calmly without resetting to intake mode.

OUTPUT FORMAT:
You MUST respond with ONLY a single valid JSON object, with no markdown fences (\`\`\`json), backticks, or trailing commentary.

JSON schema:
{
  "chatReply": string,
  "currentMode": "Intake" | "DocumentRequest" | "Summary" | "Emergency",
  "triageLevel": "Emergency" | "Urgent" | "Routine",
  "triageReason": string | null,
  "patientName": string | null,
  "age": string | null,
  "sex": string | null,
  "primarySymptoms": string[] | null,
  "symptomOnsetPattern": string | null,
  "prakriti": string | null,
  "vikriti": string | null,
  "agni": string | null,
  "koshtha": string | null,
  "aharaVihara": string | null,
  "nidana": string | null,
  "samprapti": string | null,
  "medicalHistory": string | null,
  "knownAllergies": string | null,
  "currentMedications": string | null,
  "requestedDocuments": string[] | null,
  "aiIdentifiedConcerns": string | null,
  "suggestedSteps": string[] | null,
  "physicianSummary": string | null
}
When currentMode is "Summary", also ensure "aiIdentifiedConcerns" (cautious non-diagnostic notes) and "suggestedSteps" (safe, non-pharmacological self-care/monitoring advice) are populated.
Only include values established during the session; use null for fields not yet determined — EXCEPT physicianSummary, which must be fully articulated whenever currentMode is "Summary".`
        };
        // Setup the base payload WITHOUT the model (injected by fallback function)
        const basePayload = {
            messages: [systemPrompt, ...messages],
            temperature: 0.1,
            response_format: { type: "json_object" }
        };

        // Define your exact fallback order
        const modelsToTry = [
            "openai/gpt-oss-120b",
            "llama3-70b-8192",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",

        ];

        // Process request through the fallback loop
        const { response, data } = await callGroqWithFallback(basePayload, modelsToTry);

        if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
            return res.status(502).json({ error: "All AI models are currently unavailable." });
        }

        let rawContent = data.choices[0].message.content.trim();
        if (rawContent.startsWith("```json")) rawContent = rawContent.substring(7);
        if (rawContent.startsWith("```")) rawContent = rawContent.substring(3);
        if (rawContent.endsWith("```")) rawContent = rawContent.substring(0, rawContent.length - 3);
        rawContent = rawContent.trim();

        try {
            JSON.parse(rawContent);
            res.json({ response: rawContent });
        } catch (parseError) {
            res.json({
                response: JSON.stringify({ currentMode: "Intake", chatReply: rawContent || "Could you please repeat that?" })
            });
        }

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Failed Communication" });
    }
});

app.post('/api/generate-summary-pdf', async (req, res) => {
    try {
        const data = req.body || {};
        const referenceId = generateReferenceId();
        const pdfBuffer = await buildSummaryPdf(data, referenceId);
        const jwt = require('jsonwebtoken');
        const User = require('./models/userModel.js');
        const token = req.cookies.jwt;
        let decodedUserId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                decodedUserId = decoded.userId;
                const updateFields = {};

                // Only save if the AI actually found real data
                if (data.medicalHistory && data.medicalHistory.length > 10) updateFields.medicalHistory = data.medicalHistory;
                if (data.knownAllergies && data.knownAllergies.length > 5) updateFields.allergies = data.knownAllergies;
                if (data.currentMedications && data.currentMedications.length > 5) updateFields.medications = data.currentMedications;

                if (Object.keys(updateFields).length > 0) {
                    await User.findByIdAndUpdate(decoded.userId, updateFields);
                    console.log("[AI] Successfully saved patient memory to DB.");
                }
            } catch (e) { console.log("LTM Save Error:", e.message); }
        }
        const summaryId = crypto.randomUUID();
        const filePath = path.join(TEMP_DIR, `summary_${summaryId}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);

        const fhirData = buildFHIRBundle(data, referenceId);
        fs.writeFileSync(path.join(TEMP_DIR, `fhir_${summaryId}.json`), JSON.stringify(fhirData));

        const pdfDownloadUrl = `/api/summary-pdf/${summaryId}`;
        const fhirUrl = `/api/summary-fhir/${summaryId}`;

        const baseUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
        const qrCodeDataUrl = await QRCode.toDataURL(`${baseUrl}${pdfDownloadUrl}`, { margin: 1, width: 300 });

        // Track this summary for the Download page (best-effort; doesn't block the response)
        if (decodedUserId) {
            try {
                await Record.create({
                    userId: decodedUserId,
                    type: 'summary',
                    title: `AI Summary — ${referenceId}`,
                    fileUrl: pdfDownloadUrl,
                    referenceId,
                });
            } catch (e) { console.log("Record Save Error (summary):", e.message); }
        }

        res.json({ summaryId, referenceId, pdfDownloadUrl, fhirUrl, qrCodeDataUrl });
    } catch (error) {
        console.error("Summary PDF/QR generation error:", error);
        res.status(500).json({ error: "Failed to generate summary PDF." });
    }
});

app.get('/api/summary-pdf/:id', (req, res) => {
    const filePath = path.join(TEMP_DIR, `summary_${req.params.id}.pdf`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Summary not found or expired.");
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Parchi_Summary_${req.params.id}.pdf"`);
    fs.createReadStream(filePath).pipe(res);
});

app.get('/api/summary-fhir/:id', (req, res) => {
    const filePath = path.join(TEMP_DIR, `fhir_${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "FHIR bundle not found or expired." });
    }
    res.setHeader("Content-Type", "application/fhir+json");
    fs.createReadStream(filePath).pipe(res);
});

// --- Download page: list of past summaries + uploaded documents for the logged-in user ---
app.get('/api/records', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.jwt;

        if (!token) return res.status(401).json({ error: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const records = await Record.find({ userId: decoded.userId }).sort({ createdAt: -1 });

        res.json({ records });
    } catch (error) {
        console.error("Fetch Records Error:", error);
        res.status(401).json({ error: "Invalid or expired session" });
    }
});


// BUG FIX: Removed invalid markdown link syntax from fetch URLs
app.post('/transcribe', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No audio file provided" });

        const formData = new FormData();
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');

        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Transcription failed");

        const originalText = data.text;

        const translateResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "Translate the user's message to English. If it is already in English, return it unchanged. Respond with ONLY the translated text, nothing else." },
                    { role: "user", content: originalText }
                ],
                temperature: 0
            })
        });

        const translateData = await translateResponse.json();
        const translatedText = translateData.choices?.[0]?.message?.content?.trim() || originalText;

        res.json({ transcription: translatedText, originalTranscription: originalText });

    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Audio processing failed" });
    }
});

const startServer = async () => {
    try {
        await connectDb();
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    }
};

startServer();