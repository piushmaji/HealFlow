import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatbotMessage } from '../../services/chatbotService';
import {
  Sparkles,
  Send,
  Mic,
  Plus,
  X,
  FileText,
  Calendar,
  Stethoscope,
  Star,
  ExternalLink,
  Play,
  Square,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
  Radio,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AIChatbotComponent = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Attachment Modal / Drawer
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Audio Playback simulation
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Setup Web Speech API if supported in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
        stopRecordingVoice();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isRecording]);

  const startRecordingVoice = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err.message);
      }
    }
  };

  const stopRecordingVoice = (saveNote = false) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    if (saveNote && recordingSeconds > 0) {
      const durationFormatted = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`;
      const userText = inputMessage.trim() || 'Described clinical symptoms via voice recording';
      
      const newVoiceMsg = {
        id: `voice-${Date.now()}`,
        sender: 'user',
        isVoiceNote: true,
        duration: durationFormatted,
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newVoiceMsg]);
      setInputMessage('');
      setRecordingSeconds(0);
      handleProcessAiResponse(userText);
    }
  };

  const handleSendMessage = async (textOverride = null) => {
    const textToSend = textOverride || inputMessage;
    if (!textToSend.trim() && attachedFiles.length === 0) return;

    const userText = textToSend.trim();
    const files = [...attachedFiles];

    const newUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText || 'Uploaded medical documents for clinical triage evaluation',
      attachments: files,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textOverride) setInputMessage('');
    setAttachedFiles([]);
    setShowAttachMenu(false);

    let triageInput = userText;
    if (files.length > 0) {
      const attachSummary = files.map((f) => `[Attachment: ${f.name} - ${f.content || f.type}]`).join('\n');
      triageInput = `${userText}\n\nClinical Attachments:\n${attachSummary}`.trim();
    }

    await handleProcessAiResponse(triageInput);
  };

  const handleProcessAiResponse = async (queryText) => {
    setIsTyping(true);

    try {
      const botResponse = await sendChatbotMessage(queryText);
      const mainText = botResponse?.message || 'I have evaluated your symptoms. Below is your clinical guidance:';
      const specialty = botResponse?.specialty || null;
      const doctors = botResponse?.doctors || [];

      let specialtyReason = '';
      if (specialty === 'Cardiology') {
        specialtyReason = 'Cardiologists evaluate cardiac arrhythmias, chest tightness, palpitations, and hypertension management.';
      } else if (specialty === 'Dermatology') {
        specialtyReason = 'Dermatologists diagnose cutaneous rashes, dermatitis, allergic urticaria, and skin lesions.';
      } else if (specialty === 'Orthopedics') {
        specialtyReason = 'Orthopedic specialists treat musculoskeletal injuries, acute fractures, spinal discomfort, and joint arthritis.';
      } else if (specialty === 'Pediatrics') {
        specialtyReason = 'Pediatric specialists treat infant and child wellness, infectious fevers, and developmental milestones.';
      } else if (specialty === 'Neurology') {
        specialtyReason = 'Neurologists treat migraine disorders, nerve compression, syncope, and neurological dysfunctions.';
      } else {
        specialtyReason = 'A General Physician will evaluate your primary symptoms, perform baseline diagnostic tests, and direct clinical referrals.';
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: mainText,
        suggestedSpecialty: specialty,
        specialtyReason,
        showDoctors: doctors.length > 0,
        doctors: doctors.slice(0, 4),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat processing error:', err);
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'I am here to guide your specialty triage. Please share your symptoms or concerns in detail so I can match available doctors on HealFlow.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newAttachment = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.type.includes('pdf') ? 'Prescription PDF' : 'Clinical Image',
      size: `${(file.size / 1024).toFixed(1)} KB`,
    };

    setAttachedFiles((prev) => [...prev, newAttachment]);
    setShowAttachMenu(false);
  };

  const handleAddPrescriptionPaste = () => {
    if (!prescriptionText.trim()) return;

    const newAttachment = {
      id: `rx-${Date.now()}`,
      name: 'Pasted Doctor Prescription / Chat',
      type: 'Doctor Prescription Note',
      content: prescriptionText.trim(),
    };

    setAttachedFiles((prev) => [...prev, newAttachment]);
    setPrescriptionText('');
    setShowPrescriptionModal(false);
    setShowAttachMenu(false);
  };

  const quickPills = [
    { label: 'Find a doctor', prompt: 'I want to find a doctor for consultation' },
    { label: 'Chest tightness', prompt: 'Chest tightness and shortness of breath during walking' },
    { label: 'Severe headache', prompt: 'Severe headache and migraine with light sensitivity' },
    { label: 'Skin rash', prompt: 'Itchy red rash on skin with small bumps' },
    { label: 'Child fever', prompt: 'Child has mild fever and cold symptoms' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-3xl shadow-xs overflow-hidden font-sans border border-slate-200/90 relative">
      
      {/* =========================================================================
          1. PERSISTENT TOP HEADER (Fixed on top, never scrolls)
          ========================================================================= */}
      <div className="px-5 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1B2559] to-[#4C5BBD] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-[#1F1F1F] font-heading tracking-tight">
                AI Specialist Guide
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live RAG Engine</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6B6E84] font-medium hidden sm:block">
              Conversational symptom triage, voice input, doctor matching & prescription guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="px-3 py-1.5 rounded-full bg-[#F8FAFE] hover:bg-rose-50 text-[#6B6E84] hover:text-rose-600 text-xs font-bold transition-all border-0 cursor-pointer flex items-center gap-1.5"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="px-3.5 py-1.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all border-0 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Doctors</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SCROLLABLE CHAT MESSAGES VIEWPORT (Takes remaining height, inner scroll)
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 bg-[#F9FBFF] space-y-4 no-scrollbar">
        
        {/* Empty State / Welcome Splash */}
        {messages.length === 0 && (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center space-y-5 py-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#EEF2FF] to-white text-[#4C5BBD] flex items-center justify-center shadow-xs border border-[#DCE5FA]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-[#1F1F1F] font-heading">
                How can I guide your health today?
              </h2>
              <p className="text-xs text-[#6B6E84] leading-relaxed max-w-md">
                Describe your symptoms in English or Hindi, speak with microphone, or paste doctor notes. The AI RAG engine will pinpoint the right medical department and verified doctors.
              </p>
            </div>

            {/* Quick Starter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg pt-2">
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handleSendMessage(pill.prompt)}
                  className="px-4 py-2 rounded-full bg-white text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fade-in max-w-3xl mx-auto`}
            >
              {/* Voice Note Message */}
              {isUser && msg.isVoiceNote ? (
                <div className="bg-[#1F1F1F] text-white rounded-3xl px-5 py-3 flex items-center gap-3.5 shadow-md max-w-[90%] sm:max-w-[75%]">
                  <button
                    type="button"
                    onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border-0 cursor-pointer transition-colors"
                  >
                    {playingAudioId === msg.id ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>

                  <div className="flex items-center gap-0.5 h-5 flex-1">
                    {[12, 18, 8, 22, 16, 10, 24, 14, 8, 20, 16, 12, 18, 14, 6].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-1 rounded-full ${playingAudioId === msg.id ? 'bg-[#7C88E0] animate-pulse' : 'bg-white/60'}`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-mono text-white/80">{msg.duration || '00:15'}</span>
                </div>
              ) : isUser ? (
                /* Standard User Text Bubble */
                <div className="bg-[#1F1F1F] text-white rounded-3xl px-5 py-3 text-xs sm:text-sm font-medium max-w-[90%] sm:max-w-[80%] shadow-md leading-relaxed space-y-2">
                  <p>{msg.text}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-white/20">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/10 text-xs">
                          <FileText className="w-4 h-4 text-indigo-300 shrink-0" />
                          <span className="truncate flex-1 font-bold">{att.name}</span>
                          <span className="text-[10px] text-white/70">{att.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* AI Clinical Response Card */
                <div className="space-y-3 max-w-[95%] sm:max-w-[88%]">
                  <div className="bg-white rounded-3xl p-5 sm:p-6 text-[#1F1F1F] shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2 text-[#4C5BBD] font-black text-xs font-heading">
                      <Sparkles className="w-4 h-4" />
                      <span>HealFlow Medical Intelligence</span>
                    </div>

                    <p className="whitespace-pre-line text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {msg.text}
                    </p>
                  </div>

                  {/* Recommended Specialty Card */}
                  {msg.suggestedSpecialty && (
                    <div className="bg-gradient-to-r from-[#EEF2FF] to-white rounded-3xl p-4 sm:p-5 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-black text-[#4C5BBD] text-xs sm:text-sm font-heading">
                        <Stethoscope className="w-4 h-4" />
                        <span>Recommended Specialty: {msg.suggestedSpecialty}</span>
                      </div>
                      {msg.specialtyReason && (
                        <p className="text-xs text-[#6B6E84] leading-relaxed">
                          {msg.specialtyReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Matched Verified Doctor Cards */}
                  {msg.showDoctors && msg.doctors && msg.doctors.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <p className="text-xs font-bold text-[#6B6E84]">
                        Available {msg.suggestedSpecialty || ''} Specialists on HealFlow:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.doctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                          >
                            <div
                              onClick={() => navigate(doc.profile_url || `/doctors/${doc.id}`)}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <img
                                src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                                alt={doc.name}
                                className="w-12 h-12 rounded-2xl object-cover shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h4 className="text-xs sm:text-sm font-black text-[#1F1F1F] group-hover:text-[#4C5BBD] transition-colors truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-[11px] text-[#4C5BBD] font-bold truncate">
                                  {doc.specialty} • {doc.experience_years || 10} yrs+
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{doc.rating || 4.9}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => navigate(`/book/${doc.id}`)}
                              className="w-full py-2.5 px-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold transition-all border-0 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book Slot • {doc.consultation_fee ? formatCurrency(doc.consultation_fee) : '₹500'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className="text-[10px] text-slate-400 font-medium px-2">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 max-w-3xl mx-auto p-4 bg-white rounded-3xl shadow-xs w-fit">
            <Sparkles className="w-4 h-4 text-[#4C5BBD] animate-pulse" />
            <span className="text-xs font-bold text-[#6B6E84]">AI Specialist is analyzing clinical symptoms...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =========================================================================
          3. ATTACHMENT PREVIEW DRAWER (If any file or Rx attached)
          ========================================================================= */}
      {attachedFiles.length > 0 && (
        <div className="px-5 py-2.5 bg-indigo-50/70 border-t border-indigo-100 flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-[11px] font-bold text-[#4C5BBD]">Attachments:</span>
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-xs font-medium shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#4C5BBD]" />
              <span className="truncate max-w-[140px] text-[11px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                className="text-slate-400 hover:text-rose-500 bg-transparent border-0 cursor-pointer p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
      />

      {/* Attachment popover menu */}
      {showAttachMenu && (
        <div className="absolute bottom-20 left-5 bg-white rounded-3xl p-3 shadow-xl border border-slate-100 space-y-1.5 z-30 font-sans animate-fade-in w-64">
          <button
            type="button"
            onClick={() => {
              setShowPrescriptionModal(true);
              setShowAttachMenu(false);
            }}
            className="w-full p-2.5 rounded-2xl hover:bg-[#F2F5FF] text-left text-xs font-bold text-[#1F1F1F] flex items-center gap-2.5 transition-colors cursor-pointer border-0"
          >
            <FileText className="w-4 h-4 text-[#4C5BBD]" />
            <span>Paste Doctor Prescription</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2.5 rounded-2xl hover:bg-[#F2F5FF] text-left text-xs font-bold text-[#1F1F1F] flex items-center gap-2.5 transition-colors cursor-pointer border-0"
          >
            <Plus className="w-4 h-4 text-[#4C5BBD]" />
            <span>Upload Medical File / Image</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          4. PERSISTENT INPUT TOOLBAR (Pinned to bottom of card)
          ========================================================================= */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 sm:gap-3 shrink-0 z-20">
        
        {/* Plus / Attach */}
        <button
          type="button"
          onClick={() => setShowAttachMenu((prev) => !prev)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-0 cursor-pointer shrink-0 ${
            showAttachMenu ? 'bg-[#4C5BBD] text-white shadow-xs' : 'bg-[#F8FAFE] text-slate-600 hover:bg-[#EEF2FF] hover:text-[#4C5BBD]'
          }`}
          title="Attach prescription or lab report"
        >
          <Plus className={`w-4 h-4 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Describe symptoms, ask specialty, or paste Rx..."
          className="flex-1 bg-[#F8FAFE] rounded-full px-5 py-3 text-xs sm:text-sm text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4C5BBD]/20 transition-all font-medium border-0"
        />

        {/* Mic Voice Button */}
        <button
          type="button"
          onClick={isRecording ? () => stopRecordingVoice(true) : startRecordingVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0 transition-all ${
            isRecording ? 'bg-red-600 text-white animate-pulse shadow-md' : 'bg-[#F8FAFE] text-slate-600 hover:bg-[#EEF2FF] hover:text-[#4C5BBD]'
          }`}
          title={isRecording ? 'Stop recording voice' : 'Record voice query'}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() && attachedFiles.length === 0}
          className="w-10 h-10 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] disabled:bg-slate-200 text-white flex items-center justify-center border-0 shadow-xs cursor-pointer shrink-0 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Prescription Paste Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1F1F1F]">
                <FileText className="w-5 h-5 text-[#4C5BBD]" />
                <h3 className="text-base font-black">Paste Doctor Prescription</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B6E84]">
              Paste clinical notes or prescriptions to get an instant specialty analysis from the AI RAG engine.
            </p>

            <textarea
              rows={5}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="Paste Rx or notes here, e.g.:
Rx: Tab Pantocid 40mg before breakfast
Advised: Cardiology follow-up, ECG..."
              className="w-full p-4 rounded-2xl bg-[#F8FAFE] text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:bg-white resize-none border-0"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 border-0 bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPrescriptionPaste}
                disabled={!prescriptionText.trim()}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#4C5BBD] hover:bg-[#3B489E] disabled:bg-slate-200 border-0 cursor-pointer shadow-xs"
              >
                Attach to Chat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
