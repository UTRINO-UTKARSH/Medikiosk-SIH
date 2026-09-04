/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, FileText, X, Square, Upload, Check, FileUp, Sparkles, Download, QrCode, Plus, MessageSquare, Menu, AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = "parchi_multi_chat_sessions";
const ACTIVE_CHAT_KEY = "parchi_active_chat_id";

const TRIAGE_STYLES = {
  Emergency: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", dot: "bg-red-500" },
  Urgent: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500" },
  Routine: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", dot: "bg-green-500" },
};

function TriageBadge({ level, reason, compact = false }) {
  if (!level) return null;
  const style = TRIAGE_STYLES[level] || TRIAGE_STYLES.Routine;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${style.bg} ${style.text} border ${style.border} rounded-full font-semibold shrink-0 ${compact ? "text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1" : "text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5"}`}
      title={reason || level}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{level}</span>
    </span>
  );
}

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

const AI = () => {
  const { i18n, t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    }
    return [{
      id: Date.now().toString(),
      title: "New Intake Session",
      messages: [{ role: "ai", text: t('aiChat.greeting') }],
      parsedData: null,
      requestedDocuments: [],
      uploadedDocs: {},
      triageLevel: "Routine",
      triageReason: null
    }];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem(ACTIVE_CHAT_KEY) || chats[0]?.id;
  });

  // Responsive sidebar state: starts closed on small mobile screens
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [patientInput, setPatientInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [summaryFiles, setSummaryFiles] = useState(null);
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  const [generateFilesError, setGenerateFilesError] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const summaryModalRef = useRef(null);
  const summaryTriggerRef = useRef(null);

  const activeChat = chats.find(c => c.id === currentChatId) || chats[0];

  // --- Logged-in user (name + avatar initial) ---
  const [currentUser, setCurrentUser] = useState(null); // { name, ... } | null

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCurrentUser(data.user || data);
      } catch (e) {
        console.error("Failed to load current user:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [API_URL]);

  const userName = currentUser?.name || currentUser?.fullName || t('aiChat.guestUser') || "Guest User";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      localStorage.setItem(ACTIVE_CHAT_KEY, currentChatId);
    } catch (e) {
      console.error("Failed to save chat sessions:", e);
    }
  }, [chats, currentChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    if (!showSummary) return;

    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement;
    summaryModalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSummary(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [showSummary]);

  const updateActiveChat = (updater) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return typeof updater === 'function' ? updater(chat) : { ...chat, ...updater };
      }
      return chat;
    }));
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: t('aiChat.newIntakeTitle') || "New Intake Session",
      messages: [{ role: "ai", text: t('aiChat.greeting') }],
      parsedData: null,
      requestedDocuments: [],
      uploadedDocs: {},
      triageLevel: "Routine",
      triageReason: null
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setSummaryFiles(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = (e, idToDelete) => {
    e.stopPropagation();
    
    setChats(prevChats => {
      const updatedChats = prevChats.filter(c => c.id !== idToDelete);
      
      if (updatedChats.length === 0) {
        const newChat = {
          id: Date.now().toString(),
          title: t('aiChat.newIntakeTitle') || "New Intake Session",
          messages: [{ role: "ai", text: t('aiChat.greeting') }],
          parsedData: null,
          requestedDocuments: [],
          uploadedDocs: {},
          triageLevel: "Routine",
          triageReason: null
        };
        setCurrentChatId(newChat.id);
        setSummaryFiles(null);
        return [newChat];
      }
      
      if (idToDelete === currentChatId) {
        setCurrentChatId(updatedChats[0].id);
        setSummaryFiles(null);
      }
      
      return updatedChats;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmission(patientInput);
  };

  const handleSubmission = async (textToSend) => {
    if (!textToSend.trim()) return;
    if (isLoading) return;

    const newUserMessage = { role: "user", text: textToSend };

    const currentChatSnapshot = chats.find(c => c.id === currentChatId) || activeChat;
    const messagesForRequest = [...currentChatSnapshot.messages, newUserMessage];

    updateActiveChat(chat => {
      let newTitle = chat.title;
      if (chat.messages.length === 1 && (chat.title.startsWith("New Intake") || chat.title.startsWith("नई"))) {
        newTitle = textToSend.slice(0, 25) + (textToSend.length > 25 ? "..." : "");
      }
      return { ...chat, messages: messagesForRequest, title: newTitle };
    });

    setPatientInput("");
    setIsLoading(true);

    try {
      const formattedMessages = messagesForRequest.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ 
          messages: formattedMessages,
          language: i18n.resolvedLanguage || i18n.language || "en" 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('aiChat.aiServiceError'));

      const parsed = JSON.parse(data.response);

      updateActiveChat(chat => ({
        ...chat,
        messages: [...chat.messages, { role: "ai", text: parsed.chatReply || t('aiChat.defaultReply') }],
        triageLevel: parsed.triageLevel || chat.triageLevel,
        triageReason: parsed.triageReason || chat.triageReason,
        requestedDocuments: parsed.requestedDocuments?.length ? parsed.requestedDocuments : chat.requestedDocuments,
        parsedData: {
          ...chat.parsedData,
          patientName: parsed.patientName || chat.parsedData?.patientName || "",
          age: parsed.age || chat.parsedData?.age || "",
          medicalHistory: parsed.medicalHistory || chat.parsedData?.medicalHistory || "",
          primarySymptoms: parsed.primarySymptoms?.length ? parsed.primarySymptoms : chat.parsedData?.primarySymptoms || [],
          physicianSummary: parsed.physicianSummary || chat.parsedData?.physicianSummary || "",
          prakriti: parsed.prakriti || chat.parsedData?.prakriti || "",
          vikriti: parsed.vikriti || chat.parsedData?.vikriti || "",
          agni: parsed.agni || chat.parsedData?.agni || "",
          koshtha: parsed.koshtha || chat.parsedData?.koshtha || "",
          aharaVihara: parsed.aharaVihara || chat.parsedData?.aharaVihara || "",
          currentMode: parsed.currentMode || "Intake"
        }
      }));

      if (parsed.currentMode === "Summary") {
        setShowSummary(true);
      }

    } catch (error) {
      console.error("AI chat error:", error);
      updateActiveChat(chat => ({
        ...chat,
        messages: [...chat.messages, { role: "ai", text: t('aiChat.connectionError') || "Connection error. Please check your backend." }]
      }));
    } finally {
      setIsLoading(false);
    }
    inputRef.current?.focus();
  };

  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("docType", docType);

      const res = await fetch(`${API_URL}/api/upload-document`, { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();

      updateActiveChat(chat => ({
        ...chat,
        uploadedDocs: { ...chat.uploadedDocs, [docType]: file.name }
      }));

      const noteMessage = data.extractedSummary
        ? `[Uploaded ${docType}: ${file.name}] Extracted info: ${data.extractedSummary}`
        : `[Uploaded ${docType}: ${file.name}]`;
      await handleSubmission(noteMessage);
    } catch (error) {
      console.error("Document upload error:", error);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleGenerateSummaryFiles = async () => {
    if (!activeChat.parsedData) return;
    setIsGeneratingFiles(true);
    setGenerateFilesError(null);
    try {
      const res = await fetch(`${API_URL}/api/generate-summary-pdf`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeChat.parsedData,
          triageLevel: activeChat.triageLevel,
          triageReason: activeChat.triageReason,
          uploadedDocs: activeChat.uploadedDocs
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary files.");
      setSummaryFiles(data);
    } catch (error) {
      setGenerateFilesError(error.message || "Failed generating files.");
    } finally {
      setIsGeneratingFiles(false);
    }
  };

  const handleDownloadQr = () => {
    if (!summaryFiles?.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = summaryFiles.qrCodeDataUrl;
    link.download = `doctor-qr-${summaryFiles.referenceId || 'summary'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { isRecording, isTranscribing, startRecording, stopRecording } = useAudioRecorder((transcribedText) => {
    setPatientInput(transcribedText);
    inputRef.current?.focus();
  }, API_URL);

  const showDocumentUploadPanel = activeChat.requestedDocuments?.length > 0 && activeChat.parsedData?.currentMode === "DocumentRequest";
  
  const openSummary = () => {
    summaryTriggerRef.current = document.activeElement;
    setShowSummary(true);
  };

  return (
    <div className="flex h-dvh bg-gray-50 text-gray-900 font-sans overflow-hidden pt-14 relative">

      {/* --- MOBILE SIDEBAR BACKDROP OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* --- SIDEBAR (Mobile Drawer + Desktop Inline) --- */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 md:z-10
          pt-14 md:pt-0
          transition-all duration-300 ease-in-out bg-white flex flex-col border-r border-gray-200 shrink-0 shadow-xl md:shadow-sm overflow-hidden
          w-72 sm:w-64 max-w-[85vw] md:max-w-none
          ${sidebarOpen ? 'translate-x-0 md:w-64' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-3 flex items-center justify-between border-b border-gray-100 min-w-[16rem]">
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B2D]"
          >
            <Menu size={19} />
          </button>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider pr-2">
            {t('aiChat.history') || "History"}
          </span>
        </div>

        {/* New Chat Button */}
        <div className="p-3 min-w-[16rem]">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[#0F1B2D] hover:bg-blue-950 active:scale-[0.99] text-white text-sm font-medium py-2.5 px-4 rounded-xl shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F1B2D]"
          >
            <Plus size={17} /> {t('aiChat.newChat') || "New chat"}
          </button>
        </div>

        {/* Recents List */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 min-w-[16rem]">
          <p className="text-xs font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">{t('aiChat.recents') || "Recents"}</p>
          {chats.map(chat => (
            <div key={chat.id} className="relative group flex items-center">
              <button
                onClick={() => { 
                  setCurrentChatId(chat.id); 
                  setSummaryFiles(null);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                aria-current={chat.id === currentChatId ? "true" : undefined}
                className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm truncate transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B2D] ${chat.id === currentChatId ? 'bg-blue-50 text-[#0F1B2D] font-semibold border border-blue-100 pr-9' : 'text-gray-600 hover:bg-gray-100 pr-9'}`}
              >
                <MessageSquare size={15} className="shrink-0 text-gray-400" />
                <span className="truncate flex-1">{chat.title}</span>
                {chat.triageLevel && chat.triageLevel !== "Routine" && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${TRIAGE_STYLES[chat.triageLevel]?.dot || "bg-gray-300"}`} title={chat.triageLevel} />
                )}
              </button>
              
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className={`absolute right-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-opacity ${chat.id === currentChatId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                aria-label="Delete chat"
                title="Delete this chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-gray-200 flex items-center gap-3 bg-gray-50/50 min-w-[16rem]">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {userInitial}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-[11px] text-gray-500 truncate">{t('aiChat.clinicalIntakePro') || "Clinical Intake Pro"}</p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT WINDOW --- */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-gray-50 overflow-hidden">

        {/* Top Header Bar */}
        <header className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-xs shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-600 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B2D]"
            >
              <Menu size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            <span className="font-bold text-sm sm:text-base text-[#0F1B2D] tracking-tight truncate">
              {t('aiChat.Ai-name') || "Parchi AI"}
            </span>

            {activeChat.parsedData && (
              <div className="shrink-0">
                <TriageBadge level={activeChat.triageLevel} reason={activeChat.triageReason} compact />
              </div>
            )}
          </div>

          <button
            ref={summaryTriggerRef}
            onClick={openSummary}
            className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
          >
            <FileText size={15} className="shrink-0" />
            <span className="hidden xs:inline sm:inline">{t('aiChat.viewSummary') || "View Summary"}</span>
            <span className="inline xs:hidden">Summary</span>
          </button>
        </header>

        {/* Chat Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
          <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-6">
            {activeChat.messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 sm:gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F1B2D] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles size={13} className="sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[88%] sm:max-w-[80%] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] leading-relaxed rounded-2xl shadow-xs wrap-break-word ${msg.role === 'user' ? 'bg-[#0F1B2D] text-white rounded-tr-xs' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'}`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-[#0F1B2D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-xs">
                    {userInitial}
                  </div>
                )}
              </div>
            ))}

            {/* Document Upload Panel */}
            {showDocumentUploadPanel && (
              <div className="w-full sm:ml-10 sm:w-[calc(100%-2.5rem)] bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                  <FileUp size={14} /> {t('aiChat.requestedDocuments') || "Requested Documents"}
                </p>
                {activeChat.requestedDocuments.map((docType, idx) => (
                  <div key={idx} className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 bg-gray-50 rounded-lg sm:rounded-xl px-3 py-2.5 border border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium truncate max-w-full xs:max-w-[65%]">{docType}</span>
                    {activeChat.uploadedDocs?.[docType] ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium truncate max-w-full xs:max-w-[35%]">
                        <Check size={13} className="shrink-0" /> <span className="truncate">{activeChat.uploadedDocs[docType]}</span>
                      </span>
                    ) : (
                      <label className={`w-full xs:w-auto text-center flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition shrink-0 ${uploadingDoc === docType ? "bg-orange-50 text-orange-600 cursor-wait" : uploadingDoc !== null || isLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#0F1B2D] text-white hover:bg-blue-950"}`}>
                        <Upload size={12} /> {uploadingDoc === docType ? t('aiChat.uploading') : t('aiChat.upload')}
                        <input
                          type="file"
                          accept=".pdf,image/*,.txt"
                          className="hidden"
                          disabled={uploadingDoc !== null || isLoading}
                          onChange={(e) => handleDocUpload(docType, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3 w-full justify-start" aria-live="polite" aria-label="ClinScribe AI is typing">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F1B2D] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles size={13} className="sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-2xl flex gap-1.5 items-center shadow-xs">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <footer className="p-2.5 sm:p-4 bg-gray-50 flex flex-col items-center shrink-0 gap-1.5 border-t border-gray-100 sm:border-t-0">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 shadow-xs focus-within:border-[#0F1B2D] transition">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
              aria-pressed={isRecording}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B2D] ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#0F1B2D] hover:bg-gray-100'}`}
            >
              {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              placeholder={isRecording ? t('aiChat.listening') : isTranscribing ? t('aiChat.transcribing') : t('aiChat.typeSymptoms')}
              disabled={isRecording || isTranscribing || isLoading}
              aria-label="Message"
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-base sm:text-base text-gray-900 placeholder-gray-400 px-1 sm:px-2 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={!patientInput.trim() || isLoading}
              aria-label="Send message"
              className="bg-[#0F1B2D] hover:bg-blue-950 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F1B2D]"
            >
              <Send size={16} />
            </button>
          </form>
          <span className="sr-only" aria-live="polite">
            {isRecording ? "Recording audio" : isTranscribing ? "Transcribing audio" : ""}
          </span>
        </footer>
      </main>

      {/* --- SUMMARY MODAL (Fully Responsive) --- */}
      {showSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-modal-title"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowSummary(false)} />

          <div
            ref={summaryModalRef}
            tabIndex={-1}
            className="relative bg-white border border-gray-200 w-full max-w-lg max-h-[90dvh] rounded-xl sm:rounded-2xl shadow-xl overflow-hidden text-gray-900 z-10 focus:outline-none flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 id="summary-modal-title" className="font-semibold text-base sm:text-lg flex items-center gap-2 text-[#0F1B2D] truncate">
                <FileText size={18} className="text-[#0F1B2D] shrink-0" /> {t('aiChat.physicianSummary')}
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                aria-label="Close summary"
                className="text-gray-400 hover:text-gray-700 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B2D] rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3.5 sm:gap-4 text-xs sm:text-sm">
              {activeChat.parsedData ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Triage Level</p>
                    <TriageBadge level={activeChat.triageLevel} reason={activeChat.triageReason} />
                  </div>

                  {activeChat.triageLevel && activeChat.triageLevel !== "Routine" && activeChat.triageReason && (
                    <div className={`flex items-start gap-2 p-2.5 sm:p-3 rounded-xl border ${TRIAGE_STYLES[activeChat.triageLevel]?.border || "border-gray-200"} ${TRIAGE_STYLES[activeChat.triageLevel]?.bg || "bg-gray-50"}`}>
                      <AlertTriangle size={15} className={`${TRIAGE_STYLES[activeChat.triageLevel]?.text || "text-gray-600"} shrink-0 mt-0.5`} />
                      <p className={`text-xs ${TRIAGE_STYLES[activeChat.triageLevel]?.text || "text-gray-600"}`}>{activeChat.triageReason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Patient Name</p>
                      <p className="font-medium text-gray-900 truncate">{activeChat.parsedData.patientName || t('aiChat.notProvided')}</p>
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Age</p>
                      <p className="font-medium text-gray-900">{activeChat.parsedData.age || t('aiChat.notProvided')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Primary Symptoms</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {activeChat.parsedData.primarySymptoms?.length > 0 ? (
                        activeChat.parsedData.primarySymptoms.map((sym, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                            {sym}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No Symptoms Recorded</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Medical History</p>
                    <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-200">
                      {activeChat.parsedData.medicalHistory || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Clinical Summary</p>
                    <div className="p-3 sm:p-4 bg-blue-50 border-l-2 border-[#0F1B2D] rounded-r-xl border">
                      <p className="text-xs sm:text-sm text-[#0F1B2D] leading-relaxed">
                        {activeChat.parsedData.physicianSummary || "Gathering Info..."}
                      </p>
                    </div>
                  </div>

                  {/* Medical Disclaimer */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-0.5">Medical Disclaimer</p>
                    <p className="text-[11px] sm:text-xs text-red-600 leading-relaxed">
                      This is an AI-generated preliminary triage summary and should not be used as a substitute for professional medical advice or formal diagnosis.
                    </p>
                  </div>

                  {/* PDF & QR Code Generator */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 mt-0.5">
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Download &amp; Share</p>
                    {!summaryFiles ? (
                      <button
                        onClick={handleGenerateSummaryFiles}
                        disabled={isGeneratingFiles || !activeChat.parsedData?.physicianSummary}
                        className="w-full flex items-center justify-center gap-2 bg-[#0F1B2D] text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-3 rounded-lg hover:bg-blue-950 disabled:opacity-40 transition shadow-xs"
                      >
                        {isGeneratingFiles ? "Generating..." : <><FileText size={15} /> Generate PDF &amp; QR Code</>}
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3.5 items-center sm:items-start justify-between">
                        <a
                          href={`${API_URL}${summaryFiles.pdfDownloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto text-center flex items-center justify-center gap-2 bg-[#0F1B2D] text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-3.5 rounded-lg hover:bg-blue-950 transition shadow-xs shrink-0"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                        <div className="flex flex-col items-center gap-1.5">
                          <img src={summaryFiles.qrCodeDataUrl} alt="Doctor QR Code" className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-gray-200 bg-white p-1 shadow-xs" />
                          <button
                            onClick={handleDownloadQr}
                            className="mt-0.5 flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-medium px-2 py-1 rounded-md transition"
                          >
                            <Download size={11} /> Save QR as PNG
                          </button>
                        </div>
                      </div>
                    )}
                    {generateFilesError && <p className="text-xs text-red-600 mt-2">{generateFilesError}</p>}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Bot size={36} className="mx-auto mb-2 opacity-30 text-gray-300" />
                  <p className="text-xs sm:text-sm">{t('aiChat.noDataExtracted') || "No data extracted yet."}<br />Start chatting to build the intake profile.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-100 flex justify-end bg-gray-50 shrink-0">
              <button
                onClick={() => setShowSummary(false)}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-xs sm:text-sm py-2 px-4 sm:px-5 rounded-lg transition"
              >
                {t('aiChat.closeSummary') || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AI;