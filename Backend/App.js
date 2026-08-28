const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require('dotenv').config()
const connectDb = require("./lib/db.js")
const app = express()
const port = 3001;
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods: ["GET", "POST"]
}))
app.use(express.json())
app.use(cookieParser())
const userRoutes = require('./routes/routes.js');
app.use('/api/users',userRoutes)
app.get('/',(req,res) => {
    res.send("hi")
})
//ai request don't edit this
app.post('/api/chat',async (req,res) => {
    try {
        const {prompt} = req.body;
        const response = await fetch("http://localhost:11434/api/generate",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                model:"qwen3:4b",
                prompt: prompt,
                stream:false,
                think:false,
                system:"You are a helpful assistant. Provide your answer in the requested JSON format. ",
                format:{
                    type:"object",
                    properties: {
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
                    required: ["patientName", "primarySymptoms", "physicianSummary"]
            
                },
                options: {
                    num_predict:200,
                    num_ctx:2048,
                    temperature:0.0
                },
            })
        })
        const data = await response.json();
        // return data.response;
        res.json({
            response: data.response
        })
    } catch (error) {
        console.error("Error: ",error)
        res.status(500).json({
            error:"Failed Communication"
        })
        
    }
})
//

app.listen(port,() => {
    console.log(`Server running at http://localhost:${port}`);
    connectDb()
})