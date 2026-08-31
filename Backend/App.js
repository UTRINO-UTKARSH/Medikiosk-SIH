const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require('dotenv').config()
const connectDb = require("./lib/db.js")
const app = express()
const port = 3001 || 5000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT"]
}))
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    connectDb()
})