/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, FileText, X, Square, Upload, Check, FileUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = "parchi_chat_session";

// --- Custom Hook for Audio Recording (UNCHANGED) ---
function useAudioRecorder(onTranscriptionComplete, apiUrl) {
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
        formData.append("audioFile", audioBlob, "patient_audio.webm");

        try {
          const response = await fetch(`${apiUrl}/transcribe`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.transcription) onTranscriptionComplete(data.transcription);
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
  const { t } = useTranslation();
  const [patientInput, setPatientInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [requestedDocuments, setRequestedDocuments] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({}); // { "recent blood test": fileObj }
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const chatEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- Load from localStorage on mount, fallback to greeting ---
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages?.length) return parsed.messages;
      }
    } catch (e) {
      console.error("Failed to load saved session:", e);
    }
    return [{ role: "ai", text: t('aiChat.greeting') }];
  });

  // Restore parsedData / requestedDocuments alongside messages on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.parsedData) setParsedData(parsed.parsedData);
        if (parsed.requestedDocuments) setRequestedDocuments(parsed.requestedDocuments);
      }
    } catch (e) {
      console.error("Failed to restore session state:", e);
    }
     
  }, []);

  // Persist to localStorage whenever relevant state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, parsedData, requestedDocuments }));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }, [messages, parsedData, requestedDocuments]);

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

    const newUserMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setPatientInput("");
    setIsLoading(true);

    try {
      const formattedMessages = [...messages, newUserMessage].map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ messages: formattedMessages })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('aiChat.aiServiceError'));
      }
      if (typeof data.response !== "string") {
        throw new Error(t('aiChat.invalidResponse'));
      }

      const parsed = JSON.parse(data.response);
      setMessages((prev) => [...prev, { role: "ai", text: parsed.chatReply || t('aiChat.defaultReply') }]);

      setParsedData((prev) => ({
        ...prev,
        patientName: parsed.patientName || prev?.patientName || "",
        age: parsed.age || prev?.age || "",
        medicalHistory: parsed.medicalHistory || prev?.medicalHistory || "",
        primarySymptoms: parsed.primarySymptoms?.length ? parsed.primarySymptoms : prev?.primarySymptoms || [],
        physicianSummary: parsed.physicianSummary || prev?.physicianSummary || "",
        currentMode: parsed.currentMode || "Intake"
      }));

      if (parsed.requestedDocuments?.length) {
        setRequestedDocuments(parsed.requestedDocuments);
      }

      if (parsed.currentMode === "Summary") {
        setShowSummary(true);
      }

    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [...prev, {
        role: "ai",
        text: error.message || t('aiChat.connectionError')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Document upload handler (per requested document type) ---
  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("docType", docType);

      const res = await fetch(`${API_URL}/api/upload-document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setUploadedDocs((prev) => ({ ...prev, [docType]: file.name }));

      // Tell the AI a document was uploaded, feeding back any extracted text/summary
      const noteMessage = data.extractedSummary
        ? `[Uploaded ${docType}: ${file.name}] Extracted info: ${data.extractedSummary}`
        : `[Uploaded ${docType}: ${file.name}]`;
      handleSubmission(noteMessage);

    } catch (error) {
      console.error("Document upload error:", error);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSkipDocuments = () => {
    handleSubmission(t('aiChat.noDocumentsToUpload') || "I don't have any of these documents to upload.");
  };

  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder((transcribedText) => {
    handleSubmission(transcribedText);
  }, API_URL);

  const handleMicTap = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const showDocumentUploadPanel = requestedDocuments.length > 0 && parsedData?.currentMode === "DocumentRequest";

  return (
    <div className="bg-gray-100 flex min-h-screen items-center justify-center p-2 md:p-10">

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
            <span className="hidden md:inline">{t('aiChat.viewSummary')}</span>
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

          {/* Document Upload Panel — shown when AI requests specific documents */}
          {showDocumentUploadPanel && (
            <div className="ml-11 bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <p className="text-xs font-bold uppercase text-blue-950 flex items-center gap-2">
                <FileUp size={14} /> {t('aiChat.requestedDocuments') || "Requested Documents"}
              </p>
              {requestedDocuments.map((docType, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <span className="text-sm text-gray-800 flex-1">{docType}</span>
                  {uploadedDocs[docType] ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <Check size={14} /> {uploadedDocs[docType]}
                    </span>
                  ) : (
                    <label className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition ${uploadingDoc === docType ? "bg-orange-100 text-orange-600 cursor-wait" : "bg-blue-100 text-blue-950 hover:bg-blue-200"}`}>
                      <Upload size={14} />
                      {uploadingDoc === docType ? (t('aiChat.uploading') || "Uploading...") : (t('aiChat.upload') || "Upload")}
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        disabled={uploadingDoc !== null}
                        onChange={(e) => handleDocUpload(docType, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
              <button
                onClick={handleSkipDocuments}
                className="text-xs text-gray-500 hover:text-gray-700 underline self-start mt-1"
              >
                {t('aiChat.dontHaveDocuments') || "I don't have any of these"}
              </button>
            </div>
          )}

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
            className={`p-4 rounded-xl shrink-0 transition-all flex flex-col items-center justify-center h-13 w-13 ${isRecording
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
              placeholder={isRecording ? t('aiChat.listening') : isTranscribing ? t('aiChat.transcribing') : t('aiChat.typeSymptoms')}
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
              <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20} /> {t('aiChat.physicianSummary')}</h3>
              <button onClick={() => setShowSummary(false)} className="hover:text-gray-300"><X size={24} /></button>
            </div>

            <div className="p-6">
              {parsedData ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.patientName')}</p>
                      <p className="font-medium text-gray-900">{parsedData.patientName || t('aiChat.notProvided')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.age')}</p>
                      <p className="font-medium text-gray-900">{parsedData.age || t('aiChat.notProvided')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.primarySymptoms')}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parsedData.primarySymptoms && parsedData.primarySymptoms.length > 0 ? (
                        parsedData.primarySymptoms.map((sym, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-medium">
                            {sym}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-900">{t('aiChat.noSymptoms')}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.medicalHistory')}</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {parsedData.medicalHistory || t('aiChat.noneReported')}
                    </p>
                  </div>

                  {Object.keys(uploadedDocs).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.uploadedDocuments') || "Uploaded Documents"}</p>
                      <div className="flex flex-col gap-1">
                        {Object.entries(uploadedDocs).map(([docType, fileName], idx) => (
                          <p key={idx} className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                            <Check size={14} className="text-green-600" /> {docType}: {fileName}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('aiChat.clinicalSummary')}</p>
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-950 rounded-r-lg">
                      <p className="text-sm text-blue-950 font-medium">
                        {parsedData.physicianSummary || t('aiChat.gatheringInfo')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot size={48} className="mx-auto mb-3 opacity-20" />
                  <p>{t('aiChat.noDataExtracted')}<br />{t('aiChat.startChatting')}</p>
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