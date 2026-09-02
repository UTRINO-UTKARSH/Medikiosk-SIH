from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import os
import shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("Model loaded successfully.")

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    temp_file_path = f"temp_{audio.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
       
        segments, info = model.transcribe(temp_file_path, beam_size=5,task="translate")
        
        # 3. Combine the transcribed segments into a single string
        transcript = " ".join([segment.text for segment in segments])
        
        # 4. Clean up the temporary file
        os.remove(temp_file_path)
        
        return {"text": transcript.strip()}
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)