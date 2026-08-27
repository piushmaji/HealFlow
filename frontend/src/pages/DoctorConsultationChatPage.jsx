import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  PhoneCall,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  Stethoscope,
  Building2,
  Lock,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export const DoctorConsultationChatPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { appointments, getPatientsAhead } = useQueue();
  const { showToast } = useToast();

  const [isTurnSimulated, setIsTurnSimulated] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const appointment =
    appointments.find((a) => a.id === appointmentId) || appointments[0];

  const rawAhead = appointment ? getPatientsAhead(appointment.doctor_id, appointment.token_number) : 5;
  const patientsAhead = isTurnSimulated ? 0 : rawAhead;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: `OPD Assistant (${appointment?.doctor_name || 'Dr. Rajesh Sharma'})`,
      text: `Namaste ${appointment?.patient_name || 'Rahul'}! Your token ${appointment?.token_number} is now called inside Room ${appointment?.room_number || '302'}. You can start chat, voice call, or video call now!`,
      time: '10:15 AM',
      isDoctor: true,
    },
  ]);

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-sans">
        <h2 className="text-xl font-bold text-[#1F1F1F]">Appointment Not Found</h2>
        <button
          onClick={() => navigate('/patients/dashboard')}
          className="mt-4 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs border-0"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // STRICT ACCESS GUARD: Chat & Calls are LOCKED until turn arrives!
  if (patientsAhead > 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-10 font-sans">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-0 shadow-xs text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-10 h-10 text-slate-600" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-[#6B6E84]">
              Room Chat & Media Locked
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-[#1F1F1F]">
              Doctor Room Unlocks When Your Turn Arrives
            </h2>

            <p className="text-xs text-[#6B6E84] leading-relaxed font-medium">
              You currently have <strong>{patientsAhead} patient(s) ahead</strong> in line for <strong>{appointment.doctor_name}</strong>.
              Doctor consultation chat, voice call, and video call options activate automatically when your token (<strong>{appointment.token_number}</strong>) is called inside <strong>{appointment.room_number || 'Room 302'}</strong>.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate(`/patients/live-queue/${appointment.id}`)}
              style={{ outline: 'none' }}
              className="px-6 py-3 rounded-full bg-[#4C5BBD] text-white text-xs font-bold hover:bg-[#3B489E] transition-all border-0 shadow-xs"
            >
              Back to Live Queue Telemetry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: `${appointment.patient_name} (Patient)`,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDoctor: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Doctor Desk Automated Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: `${appointment.doctor_name}'s Desk`,
          text: `Thank you for your update! We see your token ${appointment.token_number}. Dr. ${
            appointment.doctor_name.split(' ').slice(-1)[0]
          } is ready for you in ${appointment.room_number || 'Room 302'}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDoctor: true,
        },
      ]);
      showToast(`New reply from ${appointment.doctor_name}'s desk!`, 'info');
    }, 1200);
  };

  const handleQuickChip = (text) => {
    setInputMessage(text);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* 1. Header with Back Button & Doctor Profile Banner */}
      <div className="bg-white rounded-3xl p-6 border-0 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/patients/live-queue/${appointment.id}`)}
            style={{ outline: 'none' }}
            className="p-2.5 rounded-full bg-[#F8FAFE] text-[#6B6E84] hover:text-[#4C5BBD] hover:bg-[#F2F5FF] border-0 transition-colors shadow-xs"
            title="Back to Live Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src={appointment.doctor_avatar}
            alt={appointment.doctor_name}
            className="w-14 h-14 rounded-2xl object-cover border-0 shadow-xs shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#1F1F1F] font-sans">
                {appointment.doctor_name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Turn Active • {appointment.room_number || 'Room 302'}</span>
              </span>
            </div>

            <p className="text-xs text-[#6B6E84] mt-0.5 font-medium flex items-center gap-2">
              <span>{appointment.hospital || 'Apollo Super Speciality Hospital'}</span>
              <span>•</span>
              <span className="font-bold text-[#4C5BBD]">{appointment.specialty}</span>
            </p>
          </div>
        </div>

        {/* Doctor Communication Triggers (Audio, Video, Token) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 text-xs font-black font-sans bg-[#F2F5FF] text-[#4C5BBD] rounded-xl border-0 shadow-xs hidden sm:inline-block">
            Token: {appointment.token_number}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsVoiceCallActive(true);
              setIsVideoCallActive(false);
              setIsCallMinimized(false);
              showToast(`Connecting voice call to ${appointment.doctor_name}...`, 'info');
            }}
            style={{ outline: 'none' }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white text-[#4C5BBD] text-xs font-black transition-all shadow-xs border-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Audio Call</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsVideoCallActive(true);
              setIsVoiceCallActive(false);
              setIsCallMinimized(false);
              showToast(`Connecting HD Video Call to ${appointment.doctor_name}...`, 'info');
            }}
            style={{ outline: 'none' }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-xs border-0"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Call</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Chat & Medical Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Dedicated Real-Time Consultation Chat Room */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4 flex flex-col h-[560px]">
          
          {/* Chat Room Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F]">
                Active Consultation Room Chat
              </h3>
            </div>
            <span className="text-[10px] text-[#6B6E84] font-semibold">HIPAA Encrypted Stream</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3.5 p-4 rounded-2xl bg-[#F8FAFE] no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isDoctor ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md p-4 rounded-3xl text-xs space-y-1 ${
                    msg.isDoctor
                      ? 'bg-white text-[#1F1F1F] shadow-xs rounded-tl-sm'
                      : 'bg-[#4C5BBD] text-white shadow-xs rounded-tr-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-bold">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply Chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleQuickChip("I have arrived outside Room 302 waiting lounge.")}
              className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border-0 transition-colors shrink-0"
            >
              + Arrived Outside Room
            </button>

            <button
              type="button"
              onClick={() => handleQuickChip("Can I enter the consultation room now?")}
              className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border-0 transition-colors shrink-0"
            >
              + Can I enter now?
            </button>
          </div>

          {/* Send Form Input Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Send message to ${appointment.doctor_name}'s assistant...`}
              style={{ outline: 'none', boxShadow: 'none' }}
              className="flex-1 bg-[#F8FAFE] border-0 rounded-full px-5 py-3 text-xs text-[#1F1F1F] font-semibold shadow-xs focus:bg-white transition-all"
            />

            <button
              type="submit"
              style={{ outline: 'none' }}
              className="p-3.5 rounded-full bg-[#4C5BBD] text-white hover:bg-[#3B489E] transition-all border-0 shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right 1 Column: Appointment Context & Hospital OPD Info */}
        <div className="space-y-4">
          
          {/* Card 1: Token & Room Location */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#4C5BBD]" />
              <span>OPD Room Telemetry</span>
            </h4>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] text-center space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Your Queue Token</span>
              <p className="text-3xl font-black text-[#4C5BBD]">{appointment.token_number}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8FAFE] flex items-center justify-between">
                <span className="text-[#6B6E84]">OPD Room:</span>
                <span className="font-black text-[#1F1F1F]">{appointment.room_number || 'Room 302'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] flex items-center justify-between">
                <span className="text-[#6B6E84]">Time Slot:</span>
                <span className="font-bold text-[#4C5BBD]">{appointment.time}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Links */}
          <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] pb-2 border-b border-slate-100">
              Quick Actions
            </h4>

            <button
              type="button"
              onClick={() => navigate(`/patients/live-queue/${appointment.id}`)}
              style={{ outline: 'none' }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFE] hover:bg-[#F2F5FF] text-xs font-bold text-[#4C5BBD] transition-all border-0 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4C5BBD]" />
                <span>Track Live OPD Queue Position</span>
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* 3. Audio Voice Call Overlay Modal (Rendered via React Portal onto document.body to cover Topbar Header 100%) */}
      {isVoiceCallActive && createPortal(
        isCallMinimized ? (
          /* Minimized Floating Audio Call PIP Widget in Bottom Right */
          <div className="fixed bottom-6 right-6 z-[999999] bg-[#161B33] text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-0 animate-fade-in font-sans">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0">
              <img src={appointment.doctor_avatar} alt={appointment.doctor_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black truncate max-w-[120px]">{appointment.doctor_name}</p>
              <p className="text-[10px] text-emerald-400 font-mono">Audio (00:32)</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCallMinimized(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Expand Call"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsVoiceCallActive(false)}
              className="p-1.5 rounded-full bg-rose-600 text-white"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Screen Portal Backdrop Blur z-[999999] bg-black/60 Audio Call Modal */
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#161B33] text-white rounded-3xl p-8 shadow-2xl border-0 w-full max-w-sm text-center space-y-6 font-sans animate-fade-in relative">
              <button
                type="button"
                onClick={() => setIsCallMinimized(true)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                title="Minimize & Chat Simultaneously"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 overflow-hidden mx-auto shadow-lg relative">
                <img
                  src={appointment.doctor_avatar}
                  alt={appointment.doctor_name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-emerald-500 text-[8px] font-black uppercase text-white py-0.5">
                  Connected
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-sans">{appointment.doctor_name}</h3>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">{appointment.specialty} • OPD Room 302</p>
                <p className="text-xs text-slate-400 mt-2 font-mono">Live Call Active (00:32)</p>
              </div>

              {/* Live Audio Visualizer Animation */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                    isMuted ? 'bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceCallActive(false);
                    showToast('Voice call ended.', 'info');
                  }}
                  style={{ outline: 'none' }}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* 4. HD Video Call Overlay Modal (Rendered via React Portal onto document.body to cover Topbar Header 100%) */}
      {isVideoCallActive && createPortal(
        isCallMinimized ? (
          /* Minimized Floating Video Call PIP Widget in Bottom Right */
          <div className="fixed bottom-6 right-6 z-[999999] bg-[#161B33] text-white p-3 rounded-3xl shadow-2xl flex items-center gap-3 border-0 animate-fade-in font-sans">
            <div className="w-16 h-12 rounded-xl overflow-hidden relative shrink-0">
              <img src={appointment.doctor_avatar} alt={appointment.doctor_name} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-emerald-500 text-[7px] font-black text-center text-white">LIVE</span>
            </div>
            <div>
              <p className="text-xs font-black truncate max-w-[120px]">{appointment.doctor_name}</p>
              <p className="text-[10px] text-emerald-400 font-mono">Video (00:45)</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCallMinimized(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Expand Video"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsVideoCallActive(false)}
              className="p-1.5 rounded-full bg-rose-600 text-white"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Screen Portal Backdrop Blur z-[999999] bg-black/60 Video Call Modal */
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#161B33] text-white rounded-3xl p-6 shadow-2xl border-0 w-full max-w-2xl space-y-4 font-sans animate-fade-in relative overflow-hidden">
              
              {/* Video Canvas Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black uppercase text-white">HD Video Consultation Room</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCallMinimized(true)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 px-2.5"
                    title="Chat simultaneously while on video call"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Minimize & Chat</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-400">00:45</span>
                </div>
              </div>

              {/* Doctor Video Feed Display */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={appointment.doctor_avatar}
                  alt={appointment.doctor_name}
                  className="w-full h-full object-cover"
                />

                {/* Patient Self Video Camera Picture-in-Picture */}
                <div className="absolute bottom-4 right-4 w-28 h-20 rounded-xl border-2 border-white bg-slate-800 overflow-hidden shadow-lg flex items-center justify-center">
                  {!isVideoOff ? (
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      alt="Patient Self View"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Camera Off</span>
                  )}
                </div>

                {/* Video Overlay Info */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-bold text-white">
                  {appointment.doctor_name} ({appointment.specialty})
                </div>
              </div>

              {/* Video Call Control Bar */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                    isMuted ? 'bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                    isVideoOff ? 'bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVideoCallActive(false);
                    showToast('Video consultation call ended.', 'info');
                  }}
                  style={{ outline: 'none' }}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

            </div>
          </div>
        ),
        document.body
      )}

    </div>
  );
};
