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
//ai request don't edit this
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3:4b", // Ensure this matches your downloaded Ollama model exactly
                prompt: prompt,
                stream: false,
                think: false,
                system: "You are ClinScribe AI, a helpful medical triage assistant. Your job is to chat with the patient to understand their symptoms. Ask ONE follow-up question at a time. If you do not know a piece of medical information yet, leave it empty or 'N/A'. ALWAYS provide a conversational response in the chatReply field.",
                format: {
                    type: "object",
                    properties: {
                        chatReply: {
                            type: "string",
                            description: "Your conversational response to the patient. Ask follow up questions here."
                        },
                        patientName: { type: "string" },
                        age: { type: "string" },
                        primarySymptoms: {
                            type: "array",
                            items: { type: "string" },
                            description: "List of the patient's current symptoms"
                        },
                        medicalHistory: {
                            type: "string",
                            description: "Any past conditions or allergies"
                        },
                        physicianSummary: {
                            type: "string",
                            description: "A concise 1-2 sentence summary of the patient's condition for the doctor"
                        }
                    },
                    // ONLY require the chat reply. The rest will populate as the conversation continues!
                    required: ["chatReply"]
                },
                options: {
                    num_predict: 300, // Increased slightly to allow for both chat and extraction
                    num_ctx: 2048,
                    temperature: 0.2 // Slightly higher than 0.0 to make conversation feel natural
                },
            })
        })
        const data = await response.json();

        if (!response.ok || typeof data.response !== "string") {
            return res.status(502).json({
                error: data.error || "The AI model is unavailable or returned an invalid response"
            });
        }

        res.json({
            response: data.response
        })
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({
            error: "Failed Communication"
        })
    }
})
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