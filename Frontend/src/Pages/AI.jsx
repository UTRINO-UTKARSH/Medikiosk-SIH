/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, FileText, X, Square } from 'lucide-react';

// --- Custom Hook for Audio Recording (UNCHANGED) ---
function useAudioRecorder(onTranscriptionComplete) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "patient_audio.webm");

        try {
          const response = await fetch("http://localhost:8000/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.text) onTranscriptionComplete(data.text);
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, isTranscribing, startRecording, stopRecording };
}

// --- Main Chatbot UI ---
const AI = () => {
  const [patientInput, setPatientInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your ClinScribe AI. Can you tell me what symptoms brought you to the hospital today?" }
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmission(patientInput);
  };

  const handleSubmission = async (textToSend) => {
    if (!textToSend.trim()) return;
    
    // 1. Add user message to UI
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setPatientInput("");
    setIsLoading(true);

    try {
      // PRO-TIP: We send the whole conversation history so the AI remembers context!
      const conversationHistory = messages.map(m => `${m.role === 'ai' ? 'AI' : 'Patient'}: ${m.text}`).join('\n');
      const fullPrompt = `${conversationHistory}\nPatient: ${textToSend}`;

      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }) // Sends history + new input
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "The AI service returned an error.");
      }
      if (typeof data.response !== "string") {
        throw new Error("The AI service returned an invalid response.");
      }

      const parsed = JSON.parse(data.response);
      setMessages((prev) => [...prev, { role: "ai", text: parsed.chatReply || "I understand. Please tell me more." }]);
      setParsedData(parsed);

    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [...prev, {
        role: "ai",
        text: error.message || "I'm having trouble connecting to the server. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder((transcribedText) => {
    handleSubmission(transcribedText);
  });
   const handleMicTap = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div className="bg-gray-100 flex min-h-screen items-center justify-center  p-2 md:p-10">
      
      {/* Main Chat Container */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-blue-950 p-5 text-white flex justify-between items-center z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={24} className="text-blue-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg md:text-xl leading-tight">ClinScribe AI</h2>
              <p className="text-blue-200 text-xs md:text-sm">Medical Triage Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSummary(true)}
            className="bg-orange-500 hover:bg-orange-600 transition px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
          >
            <FileText size={16} />
            <span className="hidden md:inline">View Summary</span>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-blue-950'}`}>
                {msg.role === 'user' ? <User size={16} className="text-blue-950" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 text-sm md:text-base ${msg.role === 'user' ? 'bg-blue-950 text-white rounded-2xl rounded-tr-sm shadow-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-white" />
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Unified Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-end gap-2">
          
          {/* Mic Button */}
          <button 
            type="button"
            onClick={handleMicTap}
            className={`p-4 rounded-xl shrink-0 transition-all flex flex-col items-center justify-center h-13 w-13 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : isTranscribing 
                  ? "bg-orange-400 text-white cursor-wait"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-950"
            }`}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
          </button>

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : isTranscribing ? "Transcribing..." : "Type your symptoms..."}
              disabled={isRecording || isTranscribing || isLoading}
              className="flex-1 bg-gray-100 border border-transparent focus:border-blue-950 focus:bg-white rounded-xl px-4 h-13 outline-none transition disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!patientInput.trim() || isLoading}
              className="bg-blue-950 text-white h-13 px-6 rounded-xl hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* --- Medical Summary Modal --- */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-950 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Physician Summary</h3>
              <button onClick={() => setShowSummary(false)} className="hover:text-gray-300"><X size={24}/></button>
            </div>
            
            <div className="p-6">
              {parsedData ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Patient Name</p>
                      <p className="font-medium text-gray-900">{parsedData.patientName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Age</p>
                      <p className="font-medium text-gray-900">{parsedData.age || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Primary Symptoms</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parsedData.primarySymptoms && parsedData.primarySymptoms.length > 0 ? (
                        parsedData.primarySymptoms.map((sym, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-medium">
                            {sym}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-900">No symptoms identified yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Medical History</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {parsedData.medicalHistory || 'None reported'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">AI Clinical Summary</p>
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-950 rounded-r-lg">
                      <p className="text-sm text-blue-950 font-medium">
                        {parsedData.physicianSummary || 'Gathering information...'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No medical data has been extracted yet.<br/>Start chatting to generate a summary.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowSummary(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AI;