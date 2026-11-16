import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatbotMessage } from '../../services/chatbotService';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  X,
  FileText,
  Calendar,
  Stethoscope,
  Star,
  ExternalLink,
  ChevronRight,
  Play,
  Square,
  Volume2,
  RotateCcw,
  Upload,
  MessageSquare,
  Activity,
  HeartPulse,
  Zap,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info
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
      recognition.lang = 'en-IN'; // supports Indian accent, English & Hinglish terms
      
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

  // Voice recording toggle
  const startRecordingVoice = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((sec) => sec + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start exception:', err.message);
      }
    }
  };

  const stopRecordingVoice = (sendAsVoiceNote = false) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    if (sendAsVoiceNote && recordingSeconds > 0) {
      const audioDuration = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`;
      const voiceQuery = inputMessage.trim() || 'Described symptoms via audio voice note';

      const userVoiceMsg = {
        id: `voice-${Date.now()}`,
        sender: 'user',
        isVoiceNote: true,
        duration: audioDuration,
        text: voiceQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userVoiceMsg]);
      setInputMessage('');
      setRecordingSeconds(0);
      handleProcessQuery(voiceQuery);
    }
  };

  // Main submission handler
  const handleSendMessage = async (textToSend = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim() && attachedFiles.length === 0) return;

    let displayQuery = query.trim();
    const currentAttachments = [...attachedFiles];

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: displayQuery || 'Uploaded clinical documents for triage review',
      attachments: currentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setAttachedFiles([]);
    setShowAttachMenu(false);

    let triagePrompt = displayQuery;
    if (currentAttachments.length > 0) {
      const attachSummary = currentAttachments.map(a => `[Attachment: ${a.name} - ${a.content || a.type}]`).join('\n');
      triagePrompt = `${displayQuery}\n\nPatient attached records:\n${attachSummary}`;
    }

    handleProcessQuery(triagePrompt);
  };

  // Backend RAG processing
  const handleProcessQuery = async (queryText) => {
    setIsTyping(true);

    try {
      // Connects to the real Node.js Express RAG backend (/api/chat/message) with pgvector
      const response = await sendChatbotMessage(queryText);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSpecialty: response.suggested_specialty,
        specialtyReason: response.specialty_reason,
        emergency: response.emergency,
        emergencyContact: response.emergency_contact,
        showDoctors: response.show_doctors,
        doctors: response.doctors || [],
        followUpQuestions: response.follow_up_question ? [response.follow_up_question] : [
          'Would you like to book an in-person or video consultation?',
          'How many days have you been experiencing this?',
          'Are you currently on any medication?'
        ],
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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[640px] max-w-2xl mx-auto overflow-hidden font-sans relative">
      
      {/* 1. Header Bar matching BridgeAI Clean Theme */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-[#4C5BBD] flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#1F1F1F] tracking-tight">HealFlow AI</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#6B6E84] font-medium">Smart Clinical Specialist & Doctor Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border-0 bg-transparent cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="p-2 rounded-full text-slate-400 hover:text-[#4C5BBD] hover:bg-indigo-50 transition-colors border-0 bg-transparent cursor-pointer"
            title="Browse all doctors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-[#F8FAFE] to-white space-y-4 no-scrollbar">
        
        {/* Empty State Screen */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-6">
            <div className="w-14 h-14 rounded-3xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-black text-[#1F1F1F]">How can I help your health today?</h3>
              <p className="text-xs text-[#6B6E84] leading-relaxed">
                Describe your symptoms, send a voice note, or share your doctor's prescription for instant specialist triage.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-1">
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handleSendMessage(pill.prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white hover:border-[#4C5BBD] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
            >
              {/* Voice Note Bubble Style (Matching BridgeAI reference) */}
              {isUser && msg.isVoiceNote ? (
                <div className="bg-[#1F1F1F] text-white rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs max-w-[85%] sm:max-w-[70%]">
                  <button
                    type="button"
                    onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border-0 cursor-pointer transition-colors"
                  >
                    {playingAudioId === msg.id ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>

                  {/* Audio Waveform simulation */}
                  <div className="flex items-center gap-0.5 h-4 flex-1">
                    {[12, 18, 8, 22, 16, 10, 24, 14, 8, 20, 16, 12, 18, 14, 6].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-1 rounded-full ${playingAudioId === msg.id ? 'bg-[#7C88E0] animate-pulse' : 'bg-white/60'}`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-white/80">{msg.duration || '00:15'}</span>
                </div>
              ) : isUser ? (
                /* Regular User Text Bubble */
                <div className="bg-[#1F1F1F] text-white rounded-2xl px-4 py-2.5 text-xs font-medium max-w-[85%] sm:max-w-[75%] shadow-xs leading-relaxed space-y-2">
                  <p>{msg.text}</p>
                  
                  {/* Attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-white/20">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                          <span className="truncate flex-1 font-bold">{att.name}</span>
                          <span className="text-[10px] text-white/70">{att.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* AI Response Bubble (Clean bridge style) */
                <div className="space-y-3 max-w-[90%] sm:max-w-[85%]">
                  <div className="bg-[#F2F5FF] text-[#1F1F1F] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-2xs border border-[#E3EAFA]">
                    <div className="flex items-center gap-2 mb-2 text-[#4C5BBD] font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>HealFlow AI Guide</span>
                    </div>

                    <p className="whitespace-pre-line text-[#2D3142]">{msg.text}</p>
                  </div>

                  {/* Recommended Specialty Alert */}
                  {msg.suggestedSpecialty && (
                    <div className="bg-white border border-indigo-100 rounded-2xl p-3 shadow-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-[#4C5BBD] text-xs">
                        <Stethoscope className="w-4 h-4" />
                        <span>Recommended Department: {msg.suggestedSpecialty}</span>
                      </div>
                      {msg.specialtyReason && (
                        <p className="text-[11px] text-[#6B6E84] leading-relaxed">
                          {msg.specialtyReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Doctor Cards Carousel / Grid (Matching Reference Layout) */}
                  {msg.showDoctors && msg.doctors && msg.doctors.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold text-[#6B6E84]">
                        Here are verified {msg.suggestedSpecialty || ''} specialists on HealFlow:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.doctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white border border-slate-200/80 hover:border-[#4C5BBD] rounded-2xl p-3 shadow-xs space-y-2.5 transition-all flex flex-col justify-between"
                          >
                            {/* Doctor Avatar & Identity */}
                            <div
                              onClick={() => navigate(doc.profile_url || `/doctors/${doc.id}`)}
                              className="flex items-center gap-2.5 cursor-pointer group"
                              title="Click to view full doctor bio and profile"
                            >
                              <img
                                src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                                alt={doc.name}
                                className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <h4 className="text-xs font-black text-[#1F1F1F] group-hover:text-[#4C5BBD] transition-colors truncate">
                                    {doc.name}
                                  </h4>
                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                </div>
                                <p className="text-[10px] text-[#4C5BBD] font-bold truncate">{doc.specialty} • {doc.experience_years || 10} yrs+</p>
                                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{doc.rating || 4.9}</span>
                                  <span className="text-slate-400 font-normal">({doc.review_count || 50}+)</span>
                                </div>
                              </div>
                            </div>

                            {/* Doctor Bio Snippet */}
                            {doc.bio && (
                              <p
                                onClick={() => navigate(doc.profile_url || `/doctors/${doc.id}`)}
                                className="text-[10px] text-[#6B6E84] line-clamp-2 leading-relaxed bg-[#F8FAFE] p-2 rounded-xl cursor-pointer hover:text-[#1F1F1F] transition-colors"
                              >
                                {doc.bio}
                              </p>
                            )}

                            {/* Action Row */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => navigate(doc.profile_url || `/doctors/${doc.id}`)}
                                className="py-1.5 px-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1F1F1F] text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer text-center"
                              >
                                View Bio
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate(doc.booking_url || `/doctors/${doc.id}/book`)}
                                className="py-1.5 px-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-[10px] font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Book {formatCurrency(doc.consultation_fee || 500)}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View full list pill button */}
                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => navigate('/doctors')}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#4C5BBD] hover:bg-[#F2F5FF] shadow-2xs transition-all cursor-pointer"
                        >
                          <span>View all available doctors</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Follow Up Pill Questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUpQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white hover:border-[#4C5BBD] shadow-2xs transition-all cursor-pointer text-left"
                        >
                          "{q}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-[9px] text-[#9CA3AF] px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-[#F2F5FF] text-[#4C5BBD] rounded-2xl w-28 shadow-2xs border border-[#E3EAFA] animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Pending Attachments Preview Tray */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {attachedFiles.map((att) => (
            <div key={att.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-[#1F1F1F] shrink-0 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#4C5BBD]" />
              <span className="max-w-[140px] truncate font-medium">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== att.id))}
                className="text-slate-400 hover:text-rose-500 bg-transparent border-0 p-0 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Live Recording Bar */}
      {isRecording && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center justify-between gap-3 shrink-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-700">Listening to your symptoms...</span>
            <span className="text-xs font-mono font-bold text-red-600">
              00:{String(recordingSeconds).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stopRecordingVoice(false)}
              className="px-3 py-1 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => stopRecordingVoice(true)}
              className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs border-0 cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Attachments Options Drawer Popup */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-20 space-y-1 w-64 animate-fade-in font-sans">
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
              setShowAttachMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD] rounded-xl transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <Upload className="w-4 h-4 text-[#4C5BBD]" />
            <span>Upload Medical File / Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPrescriptionModal(true);
              setShowAttachMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD] rounded-xl transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Paste Doctor Rx / Chat Notes</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
      />

      {/* 6. Input Control Bar (BridgeAI Minimalist Style) */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
        
        {/* Plus / Attachment button */}
        <button
          type="button"
          onClick={() => setShowAttachMenu((prev) => !prev)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border border-slate-200 cursor-pointer shrink-0 ${
            showAttachMenu ? 'bg-[#4C5BBD] text-white border-[#4C5BBD]' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
          title="Attach prescription, report or doctor notes"
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
          className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:border-[#4C5BBD] focus:bg-white transition-all font-medium"
        />

        {/* Mic Voice Button */}
        <button
          type="button"
          onClick={isRecording ? () => stopRecordingVoice(true) : startRecordingVoice}
          className={`w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0 transition-all ${
            isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
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
          className="w-9 h-9 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] disabled:bg-slate-200 text-white flex items-center justify-center border-0 shadow-xs cursor-pointer shrink-0 disabled:cursor-not-allowed transition-all"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* 7. Modal for Pasting Doctor Prescription / Notes */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1F1F1F]">
                <FileText className="w-5 h-5 text-[#4C5BBD]" />
                <h3 className="text-sm font-black">Paste Doctor Prescription / Chat</h3>
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
              Paste notes from your doctor consultation, test orders, or prescriptions. The AI Guide will summarize and recommend next specialist steps.
            </p>

            <textarea
              rows={5}
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="Paste doctor prescription text, e.g.:
Rx: Tab Pantocid 40mg once daily before breakfast.
Advised: Cardiology follow-up, ECG, Lipid Profile..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:border-[#4C5BBD] focus:bg-white resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPrescriptionPaste}
                disabled={!prescriptionText.trim()}
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#4C5BBD] hover:bg-[#3B489E] disabled:bg-slate-200 border-0 cursor-pointer shadow-xs"
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
