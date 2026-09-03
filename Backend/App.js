const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require('dotenv').config()
const connectDb = require("./lib/db.js")
const app = express()
const port = process.env.PORT || 3001;
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
].filter(Boolean);
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
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
app.use(express.json())
app.use(cookieParser())
const userRoutes = require('./routes/routes.js');
app.use('/api/users', userRoutes)
app.get('/', (req, res) => {
    res.send("hi")
})

//functions
async function callGroq(payload, retries = 1) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();

    // If Groq's JSON validator rejected the output, salvage the plain text it tried to send
    if (!response.ok && data.error?.code === "json_validate_failed" && data.error?.failed_generation) {
        return {
            response: { ok: true },
            data: {
                choices: [{ message: { content: JSON.stringify({
                    currentMode: "Intake",
                    chatReply: data.error.failed_generation
                }) } }]
            }
        };
    }

    if (!response.ok && retries > 0) {
        console.log("Retrying Groq call after failure...", data);
        return callGroq(payload, retries - 1);
    }
    return { response, data };
}

//ai request don't edit this(fallback model groq api key and ai model "openai/gpt-oss-120b",) open source and a generous free tier
app.post('/api/chat', async (req, res) => {
    try {
        const messages = req.body.messages;
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: "Data format mismatch. Send 'messages' array." });
        }

        const systemPrompt = {
    role: "system",
    content: `You are Parchi, a medical intake assistant acting as receptionist, nurse, and scribe.

Follow this flow strictly, one step at a time, asking only ONE question per turn:
1. Patient name and age
2. Chief complaint (main symptoms)
3. Duration of symptoms
4. Associated symptoms
5. Past medical history
6. Document request (see below)

STEP 6 — DOCUMENT REQUEST:
Once steps 1-5 are complete, set currentMode to "DocumentRequest" (not Summary yet).
Based on the patient's chief complaint, symptoms, and history, identify 2-4 SPECIFIC types of documents or reports that would be clinically useful (e.g. "recent blood test", "chest X-ray", "current prescription/medication list", "past discharge summary" — be specific to their condition, not generic).
In chatReply, clearly ask the patient to upload these, explicitly instructing them to upload only the MOST RECENT version of each type if they have multiple.
List the document types in the "requestedDocuments" array field.
If the patient has none of the requested documents or says so, move on to Summary mode on their next reply.

STEP 7 — SUMMARY:
After the document step is resolved (documents uploaded or patient confirms they have none), switch currentMode to "Summary" and stop asking questions.

CRITICAL: When currentMode is "Summary", you MUST write a real physicianSummary — never leave it null or empty at that point.
The physicianSummary must be a concise, professional clinical note (3-5 sentences) written the way a nurse would hand off to a doctor, synthesizing everything gathered:
- Patient's chief complaint and duration
- Associated symptoms
- Relevant medical history
- Any relevant findings from uploaded documents, if provided
- A brief note on possible urgency/triage priority if relevant (e.g. "warrants prompt evaluation given photophobia with headache")
Do NOT just restate the raw data — synthesize it into a coherent clinical narrative, as if writing the "History of Present Illness" section of a doctor's note.
Always end the physicianSummary with this disclaimer sentence: "This is an AI-generated preliminary summary intended to support consultation; final diagnosis and clinical decisions remain the responsibility of the treating physician."

If the patient's answer is unclear, off-topic, or doesn't actually answer the current question, gently re-ask the same question in chatReply — but ALWAYS still respond with the full valid JSON object, never plain text.

You MUST respond with ONLY a single valid JSON object, no markdown, no code fences, no extra text.
JSON schema:
{
  "chatReply": string,
  "currentMode": "Intake" | "DocumentRequest" | "Summary",
  "patientName": string | null,
  "age": string | null,
  "primarySymptoms": string[] | null,
  "medicalHistory": string | null,
  "requestedDocuments": string[] | null,
  "physicianSummary": string | null
}
Only include fields you have actually learned from the conversation so far; use null for fields not yet known — EXCEPT physicianSummary, which must always be filled once currentMode is "Summary".
Never wrap the JSON in \`\`\`json or any other formatting. Output raw JSON only.`
};
        const payload = {
            model: "openai/gpt-oss-120b",
            messages: [systemPrompt, ...messages],
            temperature: 0.1,
            max_tokens: 1024,
            reasoning_effort: "low",
            response_format: { type: "json_object" }
        };

        const { response, data } = await callGroq(payload);

        if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
            console.error("Groq API error:", data);
            return res.status(502).json({ error: "The AI model is unavailable." });
        }

        let rawContent = data.choices[0].message.content.trim();    
        // console.log("RAW AI OUTPUT -->", rawContent);

        if (rawContent.startsWith("```json")) rawContent = rawContent.substring(7);
        if (rawContent.startsWith("```")) rawContent = rawContent.substring(3);
        if (rawContent.endsWith("```")) rawContent = rawContent.substring(0, rawContent.length - 3);
        rawContent = rawContent.trim();

        try {
            JSON.parse(rawContent);
            res.json({ response: rawContent });
        } catch (parseError) {
            console.log("Model replied in plain text, wrapping into JSON fallback...");
            res.json({
                response: JSON.stringify({
                    currentMode: "Intake",
                    chatReply: rawContent || "Could you please repeat that?"
                })
            });
        }

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Failed Communication" });
    }
});
//
//
app.post('/transcribe', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        // Use standard Web API FormData (built into Node 18+)
        const formData = new FormData();

        // Convert the Multer buffer directly into a Blob
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

        // Append the file. We MUST pass a filename (e.g., 'audio.webm') 
        // so Groq knows the file type format.
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');

        // Make the request to the Cloud API
        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                // Note: Do NOT manually set Content-Type here. 
                // Native fetch automatically handles the complex boundaries for FormData!
            },
            body: formData
        });

        const data = await response.json();

        // No need for fs.unlinkSync because the file was never saved to the hard drive!

        if (!response.ok) {
            throw new Error(data.error?.message || "Transcription failed");
        }

        res.json({ transcription: data.text });

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
//local ai under development(qwen3:4b model)
// error: responses not accurate and confusion still presist
// app.post('/api/chat', async (req, res) => {
//     try {
//         const messages = req.body.messages;
//         if (!Array.isArray(messages)) {
//             return res.status(400).json({ error: "Data format mismatch. Send 'messages' array." });
//         }

//         const response = await fetch("http://localhost:11434/api/chat", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 model: "parchi-ai",
//                 messages: messages,
//                 stream: false,
//                 options: {
//                     temperature: 0.1
//                 }
//             })
//         });
//         const data = await response.json();
//         if (!response.ok || !data.message || typeof data.message.content !== "string") {
//             return res.status(502).json({ error: "The AI model is unavailable." });
//         }

//         let rawContent = data.message.content.trim();
//         console.log("RAW AI OUTPUT -->", rawContent); // <-- Check your terminal to see what it's saying!

//         // Clean markdown blocks if present
//         if (rawContent.startsWith("```json")) rawContent = rawContent.substring(7);
//         if (rawContent.startsWith("```")) rawContent = rawContent.substring(3);
//         if (rawContent.endsWith("```")) rawContent = rawContent.substring(0, rawContent.length - 3);
//         rawContent = rawContent.trim();

//         // Safety fallback if it outputs plain text instead of JSON
//         try {
//             JSON.parse(rawContent);
//             res.json({ response: rawContent });
//         } catch (parseError) {
            
//             // If the model just replied with a normal sentence instead of JSON, wrap it automatically!
//             console.log("Model replied in plain text, wrapping into JSON fallback...");
//             res.json({
//                 response: JSON.stringify({
//                     currentMode: "Intake",
//                     chatReply: rawContent || "Could you please repeat that?"
//                 })
//             });
//         }

//     } catch (error) {
//         console.error("Error: ", error);
//         res.status(500).json({ error: "Failed Communication" });
//     }
// });