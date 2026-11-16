import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  fetchConsultationMessagesFromBackend,
  sendConsultationMessageToBackend,
  getCallSignalFromBackend,
  updateCallSignalInBackend,
} from '../services/doctorBackendService';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { isSlotActiveNowIST } from '../utils/formatters';
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
  Users,
  CheckCircle2,
  User,
  AlertCircle,
  Camera,
  Radio,
  PhoneForwarded,
  PhoneIncoming,
  Activity,
  FileText,
  Paperclip,
  Check,
  Sparkles,
} from 'lucide-react';

export const DoctorConsultationChatPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { appointments, getPatientsAhead, updateAppointmentStatus } = useQueue();
  const { role, isDoctor, activeDoctor, patientUser, currentUser } = useAuth();
  const { showToast } = useToast();

  // Active call states
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Incoming call state (for the recipient when someone calls!)
  const [incomingCall, setIncomingCall] = useState(null); // { callType, caller }

  // Hardware permission prompt
  const [permissionPrompt, setPermissionPrompt] = useState(null); // 'audio' | 'video' | null

  // Live Timer for active calls
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Local and Remote video refs for real WebRTC stream
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pcRef = useRef(null); // Native RTCPeerConnection instance
  const [remoteStream, setRemoteStream] = useState(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  // WebRTC ICE Servers (STUN)
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // Helper to initialize RTCPeerConnection
  const initPeerConnection = (stream) => {
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
    }

    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    // Add local tracks to peer connection
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Listen for remote tracks
    pc.ontrack = (event) => {
      console.log('Received remote track from peer:', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setIsPeerConnected(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch(() => {});
        }
      }
    };

    // Send local ICE candidates to backend
    pc.onicecandidate = (event) => {
      if (event.candidate && appointmentId) {
        updateCallSignalInBackend(appointmentId, {
          action: 'ICE_CANDIDATE',
          senderRole: myRole,
          candidate: event.candidate,
        }).catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('WebRTC Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsPeerConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsPeerConnected(false);
      }
    };

    return pc;
  };

  // Attach streams to video elements
  useEffect(() => {
    if (isVideoCallActive) {
      if (localVideoRef.current && mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current) {
        if (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => {});
        } else {
          // If remote peer hasn't connected stream yet, don't show self in the main viewport!
          remoteVideoRef.current.srcObject = null;
        }
      }
    }
  }, [isVideoCallActive, remoteStream]);
  const [currentAppointment, setCurrentAppointment] = useState(() => {
    return appointments.find((a) => a.id === appointmentId) || null;
  });

  useEffect(() => {
    const found = appointments.find((a) => a.id === appointmentId);
    if (found) setCurrentAppointment(found);
  }, [appointments, appointmentId]);

  // Fallback: If not in context yet, fetch directly from Supabase
  useEffect(() => {
    if (!currentAppointment && appointmentId && isSupabaseConfigured) {
      supabase
        .from('appointments')
        .select(`*, doctors(*)`)
        .eq('id', appointmentId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setCurrentAppointment({
              ...data,
              doctor_name: data.doctors?.name || data.doctor_name || 'Dr. Specialist',
              doctor_avatar: data.doctors?.avatar_url || data.doctor_avatar || '',
              room_number: data.doctors?.room_number || data.room_number || 'Room 101',
              hospital: data.doctors?.hospital || data.hospital || 'Smart Clinic',
              date: data.slot_date,
              time: data.slot_time,
            });
          }
        });
    }
  }, [appointmentId, currentAppointment]);

  const appointment = currentAppointment;

  // Active user details
  const myRole = isDoctor ? 'doctor' : 'patient';
  const myName = isDoctor ? (activeDoctor?.name || 'Dr. Doctor') : (appointment?.patient_name || patientUser?.name || 'Patient');

  // Real-time appointment status & completion watchdog
  useEffect(() => {
    if (!appointmentId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`public:appointment_status:${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointmentId}`,
        },
        (payload) => {
          if (payload.new) {
            setCurrentAppointment((prev) => ({ ...prev, ...payload.new }));
            if (payload.new.status === 'Completed') {
              handleCleanUpMedia();
              setIsVoiceCallActive(false);
              setIsVideoCallActive(false);
              showToast('Consultation has been completed and closed.', 'info');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointmentId]);

  // Doctor Action: Complete Consultation and remove patient from chamber
  const handleCompleteConsultation = async () => {
    if (!appointmentId) return;
    try {
      handleCleanUpMedia();
      setIsVoiceCallActive(false);
      setIsVideoCallActive(false);
      await updateCallSignalInBackend(appointmentId, { action: 'END_CALL' });

      if (isSupabaseConfigured) {
        await supabase
          .from('appointments')
          .update({ status: 'Completed' })
          .eq('id', appointmentId);

        // Reset or advance queue
        await supabase
          .from('queues')
          .update({
            current_token: 'None',
            serving_patient: 'Chamber Ready',
            total_in_queue: Math.max(0, (nextPatient ? 1 : 0)),
          })
          .eq('doctor_id', activeDoctor.id);
      }

      if (updateAppointmentStatus) {
        updateAppointmentStatus(appointmentId, 'Completed');
      }

      showToast('Consultation completed! Patient discharged from chamber.', 'success');
      navigate('/live-queue');
    } catch (err) {
      console.warn('Error completing appointment:', err);
      navigate('/live-queue');
    }
  };

  // Live Timer & 30-Minute Maximum Consultation Slot Watchdog
  const MAX_SLOT_SECONDS = 30 * 60; // 30 mins session limit (1800s)

  // Call duration interval & 30-min auto completion guard
  useEffect(() => {
    let timer = null;
    if (isVoiceCallActive || isVideoCallActive) {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => {
          const nextSecs = prev + 1;
          if (nextSecs >= MAX_SLOT_SECONDS) {
            showToast('30-minute consultation window completed.', 'info');
            handleEndCall();
          }
          return nextSecs;
        });
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVoiceCallActive, isVideoCallActive]);

  const formatCallDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Other appointments for this doctor (for Next Patient card and Queue stats)
  const doctorAppointments = appointments.filter(
    (a) =>
      a.doctor_id === activeDoctor?.id ||
      (a.doctor_name && activeDoctor?.name && a.doctor_name.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );
  const nextPatient = doctorAppointments.find(
    (a) => a.id !== appointment?.id && (a.status === 'Scheduled' || a.status === 'Checked In')
  );
  const waitingPatientsLeft = doctorAppointments.filter(
    (a) => a.id !== appointment?.id && (a.status === 'Scheduled' || a.status === 'Checked In')
  ).length;
  const completedPatientsCount = doctorAppointments.filter(
    (a) => a.status === 'Completed'
  ).length;

  // Chat message management
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatBottomRef = useRef(null);

  const loadMessages = async () => {
    if (!appointmentId) return;
    try {
      const dbMsgs = await fetchConsultationMessagesFromBackend(appointmentId);
      if (Array.isArray(dbMsgs) && dbMsgs.length > 0) {
        setMessages(
          dbMsgs.map((m) => {
            const isDocMsg = m.metadata?.sender_role === 'doctor' || m.sender === 'system';
            return {
              id: m.id,
              sender: m.metadata?.sender_name || (isDocMsg ? 'Doctor' : 'Patient'),
              text: m.content,
              time: m.metadata?.created_at
                ? new Date(m.metadata.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now',
              senderRole: m.metadata?.sender_role || (isDocMsg ? 'doctor' : 'patient'),
              isDoctor: isDocMsg,
            };
          })
        );
      } else if (messages.length === 0 && appointment) {
        setMessages([
          {
            id: 'init-welcome',
            sender: `${appointment.doctor_name || 'Doctor'} OPD Chamber`,
            text: `Welcome! Live consultation channel for token ${appointment.token_number} is open. You may chat and launch audio/video calls now.`,
            time: 'Now',
            senderRole: 'doctor',
            isDoctor: true,
          },
        ]);
      }
    } catch (e) {
      console.warn('Failed to load consultation messages:', e);
    }
  };

  // Message Poller (every 1.5 seconds for instant real-time feel)
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1500);
    return () => clearInterval(interval);
  }, [appointmentId, appointment]);

  // Prevent entire page from jumping: only scroll if user is near bottom
  const chatScrollContainerRef = useRef(null);
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Real-Time Call Presence & WebRTC Signaling Poller (Every 1.2s)
  const appliedCandidatesRef = useRef(new Set());

  useEffect(() => {
    if (!appointmentId) return;

    let isSubscribed = true;
    const pollSignal = async () => {
      try {
        const signal = await getCallSignalFromBackend(appointmentId);
        if (!signal || !isSubscribed) return;

        // 1. Someone initiated a call and it's ringing
        if (signal.callState === 'RINGING') {
          if (signal.caller?.role !== myRole) {
            // I am the recipient! Show incoming call popup
            setIncomingCall({
              callType: signal.callType,
              callerName: signal.caller?.name || (myRole === 'patient' ? 'Doctor' : 'Patient'),
            });
          }
        }
        // 2. Call was accepted / in progress
        else if (signal.callState === 'CONNECTED') {
          setIncomingCall(null);
          if (signal.callType === 'video' && !isVideoCallActive) {
            setIsVideoCallActive(true);
            setIsVoiceCallActive(false);
          } else if (signal.callType === 'audio' && !isVoiceCallActive) {
            setIsVoiceCallActive(true);
            setIsVideoCallActive(false);
          }

          const otherRole = myRole === 'doctor' ? 'patient' : 'doctor';

          // WebRTC Negotiation: If we have an active RTCPeerConnection
          if (pcRef.current) {
            // If other side provided an Answer to our Offer
            if (signal.answers && signal.answers[otherRole]) {
              if (pcRef.current.signalingState === 'have-local-offer') {
                const answerDesc = new RTCSessionDescription(signal.answers[otherRole]);
                await pcRef.current.setRemoteDescription(answerDesc).catch((e) => console.warn('setRemoteDescription answer err:', e));
              }
            }

            // If other side sent ICE candidates, add them
            if (signal.iceCandidates && signal.iceCandidates[otherRole]) {
              for (const cand of signal.iceCandidates[otherRole]) {
                const candKey = JSON.stringify(cand);
                if (!appliedCandidatesRef.current.has(candKey)) {
                  appliedCandidatesRef.current.add(candKey);
                  try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (e) {
                    console.warn('addIceCandidate err:', e);
                  }
                }
              }
            }
          }
        }
        // 3. Call was ended / idle
        else if (signal.callState === 'IDLE') {
          setIncomingCall(null);
          if (isVoiceCallActive || isVideoCallActive) {
            handleCleanUpMedia();
            setIsVoiceCallActive(false);
            setIsVideoCallActive(false);
            showToast('Call ended by participant.', 'info');
          }
        }
      } catch (err) {}
    };

    const interval = setInterval(pollSignal, 1200);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [appointmentId, myRole, isVoiceCallActive, isVideoCallActive]);

  // Stop local hardware devices and close RTCPeerConnection
  const handleCleanUpMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
    }
    appliedCandidatesRef.current.clear();
    setRemoteStream(null);
    setIsPeerConnected(false);
  };

  // Launch Call (Audio or Video)
  const handleStartCall = async (type) => {
    setPermissionPrompt(type);
  };

  const handleGrantPermission = async () => {
    const type = permissionPrompt;
    setPermissionPrompt(null);
    let stream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current && type === 'video') {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Microphone/Camera permission notice:', err.message);
    }

    if (type === 'video') {
      setIsVideoCallActive(true);
      setIsVoiceCallActive(false);
    } else {
      setIsVoiceCallActive(true);
      setIsVideoCallActive(false);
    }

    // Initialize WebRTC Peer Connection and create Offer
    let localOffer = null;
    try {
      const pc = initPeerConnection(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      localOffer = offer;
    } catch (rtcErr) {
      console.warn('WebRTC offer error:', rtcErr);
    }

    // Broadcast call signal to backend
    await updateCallSignalInBackend(appointmentId, {
      action: 'START_CALL',
      callType: type,
      senderRole: myRole,
      senderName: myName,
      offer: localOffer,
    });

    showToast(`Calling ${isDoctor ? appointment?.patient_name || 'Patient' : appointment?.doctor_name}...`, 'info');
  };

  // Accept Incoming Call
  const handleAcceptIncomingCall = async () => {
    const callType = incomingCall?.callType || 'video';
    setIncomingCall(null);
    let stream = null;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Media hardware access error:', err.message);
    }

    if (callType === 'video') {
      setIsVideoCallActive(true);
      setIsVoiceCallActive(false);
    } else {
      setIsVoiceCallActive(true);
      setIsVideoCallActive(false);
    }

    // WebRTC: Check for Caller Offer and reply with Answer
    let localAnswer = null;
    try {
      const signal = await getCallSignalFromBackend(appointmentId);
      const otherRole = myRole === 'doctor' ? 'patient' : 'doctor';
      const remoteOffer = signal?.offers?.[otherRole];

      const pc = initPeerConnection(stream);
      if (remoteOffer) {
        await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        localAnswer = answer;
      }
    } catch (rtcErr) {
      console.warn('WebRTC accept/answer error:', rtcErr);
    }

    await updateCallSignalInBackend(appointmentId, {
      action: 'ACCEPT_CALL',
      senderRole: myRole,
      senderName: myName,
      answer: localAnswer,
    });

    showToast('Call connected! Camera & Mic Active.', 'success');
  };

  // Reject / Decline Incoming Call
  const handleDeclineIncomingCall = async () => {
    setIncomingCall(null);
    await updateCallSignalInBackend(appointmentId, { action: 'END_CALL' });
    showToast('Call declined', 'info');
  };

  // End Active Call
  const handleEndCall = async () => {
    handleCleanUpMedia();
    setIsVoiceCallActive(false);
    setIsVideoCallActive(false);
    setIsCallMinimized(false);
    await updateCallSignalInBackend(appointmentId, { action: 'END_CALL' });
    showToast('Call ended.', 'info');
  };

  // Toggle Mute Audio
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMute;
      });
    }
  };

  // Toggle Video Camera
  const handleToggleVideo = () => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextVideoOff;
      });
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const optimisticMsg = {
      id: `local-${Date.now()}`,
      sender: myName,
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderRole: myRole,
      isDoctor: isDoctor,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendConsultationMessageToBackend(appointmentId, {
        sender: myName,
        content: messageContent,
        sender_email: isDoctor ? activeDoctor?.email || '' : patientUser?.email || '',
        sender_role: myRole,
      });
    } catch (err) {
      console.warn('Backend message save notice:', err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-8 h-8 animate-spin text-[#4C5BBD]" />
        </div>
        <h2 className="text-xl font-black text-[#1F1F1F]">Loading Consultation Chamber...</h2>
        <p className="text-xs text-[#6B6E84]">Connecting to secure hospital telemetry and OPD database...</p>
      </div>
    );
  }

  // 1. STRICT ACCESS GUARD: If Consultation is already Completed, patient/doctor CANNOT enter
  if (appointment.status === 'Completed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
            Consultation Completed & Closed
          </span>
          <h2 className="text-2xl font-black text-[#1F1F1F] font-heading">
            Chamber Session Ended
          </h2>
          <p className="text-xs text-[#6B6E84] leading-relaxed max-w-md mx-auto">
            This consultation with <strong>{isDoctor ? appointment.patient_name || 'Patient' : appointment.doctor_name}</strong> (Token: <strong>{appointment.token_number}</strong>) has been officially completed. The chamber is now closed and calls are disabled.
          </p>
        </div>
        <button
          onClick={() => navigate(isDoctor ? '/live-queue' : '/patients/dashboard')}
          style={{ outline: 'none' }}
          className="px-6 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 cursor-pointer"
        >
          {isDoctor ? 'Back to Doctor OPD Queue' : 'Back to Patient Dashboard'}
        </button>
      </div>
    );
  }

  // 2. IST TIME SLOT GUARD: If doctor has already admitted the session ('In Session'), allow entrance immediately
  const isDemoOrInstant =
    appointment.is_demo ||
    appointment.is_instant ||
    appointment.status === 'In Session' ||
    (appointment.slot_time && /instant|demo|immediate/i.test(appointment.slot_time)) ||
    (appointment.reason && /instant|demo|presentation/i.test(appointment.reason));

  const istSlotCheck = isSlotActiveNowIST(
    appointment.date || appointment.slot_date,
    appointment.time || appointment.slot_time,
    isDemoOrInstant
  );

  if (!istSlotCheck.isActive) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center mx-auto shadow-xs border border-slate-200">
          <Clock className="w-10 h-10 animate-pulse text-[#4C5BBD]" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#F2F5FF] text-[#4C5BBD] border border-slate-200">
            IST Time Slot Locked
          </span>
          <h2 className="text-2xl font-black text-[#1F1F1F] font-heading">
            Chamber Opens at Scheduled IST Time
          </h2>
          <p className="text-xs text-[#6B6E84] leading-relaxed max-w-md mx-auto">
            {istSlotCheck.message} Doctor chamber session and OPD queue token (<strong>{appointment.token_number}</strong>) will automatically activate at your scheduled slot.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(isDoctor ? '/live-queue' : `/patients/live-queue/${appointment.id}`)}
            style={{ outline: 'none' }}
            className="px-6 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 cursor-pointer"
          >
            {isDoctor ? 'Back to Doctor OPD Queue' : 'Track Queue Position'}
          </button>
        </div>
      </div>
    );
  }

  // 3. STRICT ADMISSION GUARD: Patient cannot enter until doctor is ready or has accepted
  if (!isDoctor && appointment.status !== 'In Session') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs border border-amber-100">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
            Waiting for Doctor Admission
          </span>
          <h2 className="text-2xl font-black text-[#1F1F1F] font-heading">
            Chamber Admission Required
          </h2>
          <p className="text-xs text-[#6B6E84] leading-relaxed max-w-md mx-auto">
            Please wait outside <strong>{appointment.room_number || 'Room 101'}</strong>. Dr. <strong>{appointment.doctor_name}</strong> must call your token (<strong>{appointment.token_number}</strong>) and admit you into the chamber before chat and video can start.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(`/patients/live-queue/${appointment.id}`)}
            style={{ outline: 'none' }}
            className="px-6 py-3 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0 cursor-pointer"
          >
            Track OPD Queue Position
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* 1. TOP HEADER BAR: Clinical Profile & Quick Call Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => (isDoctor ? navigate('/live-queue') : navigate(`/patients/live-queue/${appointment.id}`))}
            style={{ outline: 'none' }}
            className="p-2.5 rounded-full bg-[#F8FAFE] text-[#6B6E84] hover:text-[#4C5BBD] hover:bg-[#F2F5FF] border border-slate-200/80 transition-all shadow-xs cursor-pointer"
            title={isDoctor ? "Back to Doctor Live Queue" : "Back to Live Queue"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src={
              isDoctor
                ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                : appointment.doctor_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
            }
            alt={isDoctor ? appointment.patient_name : appointment.doctor_name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
          />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[#1F1F1F] font-heading">
                {isDoctor ? `Patient: ${appointment.patient_name || 'Patient'}` : appointment.doctor_name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Chamber • {appointment.room_number || activeDoctor?.room_number || 'Room 101'}</span>
              </span>
            </div>

            <p className="text-xs text-[#6B6E84] mt-0.5 font-medium flex items-center gap-2 flex-wrap">
              <span>{appointment.hospital || activeDoctor?.hospital || 'HealFlow Medical Center'}</span>
              <span>•</span>
              <span className="font-bold text-[#4C5BBD]">{appointment.specialty}</span>
              {isDoctor && appointment.patient_phone && (
                <>
                  <span>•</span>
                  <span>Contact: <strong className="text-[#1F1F1F]">{appointment.patient_phone}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Call Triggers: Doctor ONLY can initiate Audio/Video call. Patient side shows Waiting for Doctor Call badge */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <span className="px-3 py-1.5 text-xs font-black bg-[#F2F5FF] text-[#4C5BBD] rounded-xl border border-slate-200/80 shadow-xs">
            Token: {appointment.token_number}
          </span>

          <span className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-800 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Max 30 Mins Slot</span>
          </span>

          {/* Audio and Video Call Buttons (Available for both Doctor and Patient in active session) */}
          <button
            type="button"
            onClick={() => handleStartCall('audio')}
            style={{ outline: 'none' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white text-[#4C5BBD] text-xs font-black transition-all shadow-xs border border-slate-200/80 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Audio Call</span>
          </button>

          <button
            type="button"
            onClick={() => handleStartCall('video')}
            style={{ outline: 'none' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-xs border-0 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Video Call</span>
          </button>

          {isDoctor && (
            <button
              type="button"
              onClick={handleCompleteConsultation}
              style={{ outline: 'none' }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-xs border-0 cursor-pointer"
              title="Mark consultation complete and admit next patient"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Visit</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION: Chat Conversation on Left, Medical Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Live Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col h-[620px]">
          
          {/* Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] font-heading">
                HIPAA Secure Real-Time Chat
              </h3>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              ● Connected Live
            </span>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto space-y-3.5 p-4 rounded-2xl bg-[#F8FAFE] no-scrollbar scroll-smooth"
          >
            {messages.map((msg) => {
              // Exact user alignment rule:
              // For Doctor: Doctor messages on RIGHT, Patient messages on LEFT
              // For Patient: Patient messages on RIGHT, Doctor messages on LEFT
              const isMyMessage = msg.senderRole === myRole;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md p-4 rounded-3xl text-xs space-y-1.5 ${
                      isMyMessage
                        ? 'bg-[#4C5BBD] text-white shadow-xs rounded-tr-sm'
                        : 'bg-white text-[#1F1F1F] border border-slate-200/80 shadow-xs rounded-tl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-bold">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggested Quick Reply Chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            {isDoctor ? (
              <>
                <button
                  type="button"
                  onClick={() => setInputMessage(`Hello ${appointment.patient_name || 'Patient'}, please describe your symptoms in detail.`)}
                  className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  + Describe Symptoms
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage(`I am reviewing your clinical file. Let's do a quick video call.`)}
                  className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  + Start Video Call
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage(`Are you currently taking any medications or have allergies?`)}
                  className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  + Medication Check
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setInputMessage(`Hello Doctor, I have arrived outside ${appointment.room_number || 'Room 101'}.`)}
                  className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  + Arrived Outside Room
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage(`Doctor, can I start our video consultation now?`)}
                  className="text-[10px] font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  + Start Consultation Call
                </button>
              </>
            )}
          </div>

          {/* Text Message & File/Prescription Attachment Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
            <label
              htmlFor="chat-file-upload"
              className="p-3 rounded-full bg-[#F8FAFE] hover:bg-[#F2F5FF] text-[#4C5BBD] border border-slate-200/90 shadow-2xs cursor-pointer transition-all shrink-0"
              title="Attach Prescription or Clinical Photo"
            >
              <Paperclip className="w-4 h-4" />
              <input
                id="chat-file-upload"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setInputMessage(`[Shared Document: ${file.name}] `);
                    };
                    reader.readAsDataURL(file);
                    showToast(`Attached ${file.name}`, 'info');
                  }
                }}
              />
            </label>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isDoctor
                  ? `Message patient ${appointment.patient_name || 'Patient'}...`
                  : `Message Dr. ${appointment.doctor_name} (share symptoms or prescription)...`
              }
              style={{ outline: 'none' }}
              className="flex-1 bg-[#F8FAFE] border border-slate-200/90 rounded-full px-5 py-3 text-xs text-[#1F1F1F] font-semibold shadow-xs focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              style={{ outline: 'none' }}
              className="p-3.5 rounded-full bg-[#4C5BBD] text-white hover:bg-[#3B489E] transition-all border-0 shadow-xs shrink-0 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right 1 Column: Telemetry & Queue Sidebars */}
        <div className="space-y-4">
          
          {/* Card 1: Current Patient / Doctor Clinical Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] flex items-center gap-1.5 font-heading">
                <User className="w-4 h-4 text-[#4C5BBD]" />
                <span>{isDoctor ? 'Current Patient Details' : 'OPD Chamber Telemetry'}</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F2F5FF] text-[#4C5BBD]">
                {appointment.token_number}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B6E84]">
                  {isDoctor ? 'Patient Name' : 'Consultant Doctor'}
                </span>
                <p className="text-sm font-black text-[#1F1F1F]">
                  {isDoctor ? appointment.patient_name || 'Patient' : appointment.doctor_name}
                </p>
                {appointment.patient_email && isDoctor && (
                  <p className="text-[11px] text-[#6B6E84]">Email: {appointment.patient_email}</p>
                )}
                {appointment.patient_phone && isDoctor && (
                  <p className="text-[11px] text-[#6B6E84]">Phone: {appointment.patient_phone}</p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B6E84]">Chief Complaint / Reason</span>
                <p className="text-xs font-bold text-[#4C5BBD]">
                  {appointment.reason || 'Routine Health Consultation & Clinical Review'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 flex items-center justify-between">
                <span className="text-[#6B6E84]">OPD Room / Chamber:</span>
                <span className="font-black text-[#1F1F1F]">{appointment.room_number || activeDoctor?.room_number || 'Room 101'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFE] border border-slate-200/80 flex items-center justify-between">
                <span className="text-[#6B6E84]">Slot Schedule:</span>
                <span className="font-bold text-[#4C5BBD]">{appointment.time || appointment.slot_time}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Next Patient in Line (Doctor Workspace) */}
          {isDoctor && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] flex items-center gap-1.5 font-heading">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>OPD Queue Progress</span>
                </h4>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {waitingPatientsLeft} Waiting Left
                </span>
              </div>

              {/* Progress Counters Strip */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Waiting Left</span>
                  <p className="text-base font-black text-amber-900 mt-0.5">{waitingPatientsLeft}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Completed Today</span>
                  <p className="text-base font-black text-emerald-900 mt-0.5">{completedPatientsCount}</p>
                </div>
              </div>

              {nextPatient ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Next in line:</span>
                    <span className="px-2 py-0.2 rounded-md text-xs font-black bg-white text-[#4C5BBD] border border-slate-200">
                      {nextPatient.token_number}
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#1F1F1F]">{nextPatient.patient_name}</p>
                  <p className="text-[11px] text-[#6B6E84]">
                    Slot: {nextPatient.slot_time || nextPatient.time} • {nextPatient.reason || 'General checkup'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#F8FAFE] text-center space-y-0.5">
                  <p className="text-xs font-bold text-[#1F1F1F]">No more patients waiting</p>
                  <p className="text-[10px] text-[#6B6E84]">Queue is clear after this consultation</p>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Live Queue Navigation */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <button
              type="button"
              onClick={() => (isDoctor ? navigate('/live-queue') : navigate(`/patients/live-queue/${appointment.id}`))}
              style={{ outline: 'none' }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFE] hover:bg-[#F2F5FF] text-xs font-bold text-[#4C5BBD] transition-all border border-slate-200/80 shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4C5BBD]" />
                <span>{isDoctor ? 'Open Doctor Queue Control Room' : 'Track Live OPD Queue Position'}</span>
              </div>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#4C5BBD]" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. INCOMING CALL MODAL POPUP (When caller rings the other person) */}
      {incomingCall && createPortal(
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-[#161B33] text-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 relative overflow-hidden border border-white/10">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 overflow-hidden mx-auto relative shadow-2xl animate-pulse">
              <img
                src={
                  isDoctor
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                    : appointment.doctor_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                }
                alt="Caller"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Audio'} Call...
              </span>
              <h3 className="text-xl font-black text-white font-heading mt-2">
                {incomingCall.callerName}
              </h3>
              <p className="text-xs text-slate-400">
                Room: {appointment.room_number || 'Room 101'} • Token {appointment.token_number}
              </p>
            </div>

            {/* Answer / Decline Buttons */}
            <div className="flex items-center justify-center gap-8 pt-2">
              <button
                type="button"
                onClick={handleDeclineIncomingCall}
                style={{ outline: 'none' }}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title="Decline Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleAcceptIncomingCall}
                style={{ outline: 'none' }}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer animate-bounce"
                title="Accept Call"
              >
                {incomingCall.callType === 'video' ? <Video className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. PERMISSION PROMPT MODAL */}
      {permissionPrompt && createPortal(
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/90 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center mx-auto shadow-xs">
              {permissionPrompt === 'video' ? <Camera className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#1F1F1F] font-heading">
                {permissionPrompt === 'video' ? 'Grant Camera & Microphone Access?' : 'Grant Microphone Access?'}
              </h3>
              <p className="text-xs text-[#6B6E84] leading-relaxed">
                HealFlow requires your {permissionPrompt === 'video' ? 'camera and microphone' : 'audio microphone'} to connect this live consultation call.
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFE] rounded-2xl border border-slate-200/80 text-[11px] text-[#6B6E84] text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Real-time encrypted stream. You can mute your mic or turn your camera off anytime.</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPermissionPrompt(null)}
                style={{ outline: 'none' }}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-xs font-bold text-[#6B6E84] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Deny
              </button>
              <button
                type="button"
                onClick={handleGrantPermission}
                style={{ outline: 'none' }}
                className="flex-1 py-3 px-4 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                Allow & Start Call
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. AUDIO VOICE CALL MODAL OVERLAY */}
      {isVoiceCallActive && createPortal(
        isCallMinimized ? (
          /* Floating Minimized Audio Widget */
          <div className="fixed bottom-6 right-6 z-[999999] bg-[#161B33] text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 border-0 animate-fade-in font-sans">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0">
              <img
                src={
                  isDoctor
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                    : appointment.doctor_avatar
                }
                alt="Voice Call"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-black truncate max-w-[120px]">
                {isDoctor ? appointment.patient_name : appointment.doctor_name}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono">Audio ({formatCallDuration(callDurationSeconds)})</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCallMinimized(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Expand Call"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleEndCall}
              className="p-1.5 rounded-full bg-rose-600 text-white cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Screen Audio Modal */
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#161B33] text-white rounded-3xl p-8 shadow-2xl border-0 w-full max-w-sm text-center space-y-6 font-sans animate-fade-in relative">
              <button
                type="button"
                onClick={() => setIsCallMinimized(true)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Minimize & Chat Simultaneously"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 overflow-hidden mx-auto shadow-lg relative">
                <img
                  src={
                    isDoctor
                      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                      : appointment.doctor_avatar
                  }
                  alt="Voice Call"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-emerald-500 text-[8px] font-black uppercase text-white py-0.5">
                  Connected
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-sans">
                  {isDoctor ? appointment.patient_name : appointment.doctor_name}
                </h3>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  {appointment.specialty} • OPD {appointment.room_number || 'Room 101'}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Live Call Active ({formatCallDuration(callDurationSeconds)})
                </p>
              </div>

              {/* Audio visualizer bounce animation */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>

              {/* Call Control Bar */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    isMuted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  style={{ outline: 'none' }}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
                  title="End Audio Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* 6. HD VIDEO CALL MODAL OVERLAY */}
      {isVideoCallActive && createPortal(
        isCallMinimized ? (
          /* Minimized Floating Video Widget */
          <div className="fixed bottom-6 right-6 z-[999999] bg-[#161B33] text-white p-3 rounded-3xl shadow-2xl flex items-center gap-3 border-0 animate-fade-in font-sans">
            <div className="w-16 h-12 rounded-xl overflow-hidden relative shrink-0">
              <img
                src={
                  isDoctor
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                    : appointment.doctor_avatar
                }
                alt="Video Call"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-emerald-500 text-[7px] font-black text-center text-white">LIVE</span>
            </div>
            <div>
              <p className="text-xs font-black truncate max-w-[120px]">
                {isDoctor ? appointment.patient_name : appointment.doctor_name}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono">Video ({formatCallDuration(callDurationSeconds)})</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCallMinimized(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Expand Video"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleEndCall}
              className="p-1.5 rounded-full bg-rose-600 text-white cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Screen Video Call */
          <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#161B33] text-white rounded-3xl p-6 shadow-2xl border border-white/10 w-full max-w-3xl space-y-4 font-sans animate-fade-in relative overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    HD Telemedicine Video Chamber
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCallMinimized(true)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 px-3 cursor-pointer"
                    title="Chat simultaneously while on video call"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Minimize & Chat</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{formatCallDuration(callDurationSeconds)}</span>
                </div>
              </div>

              {/* Video Screen Viewport */}
              <div className="relative w-full h-88 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
                {/* Active Remote Live Video Stream */}
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-3 p-6 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-slate-800/90 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <Camera className="w-10 h-10 animate-bounce" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      Connecting live camera with {isDoctor ? appointment.patient_name || 'Patient' : appointment.doctor_name}...
                    </p>
                    <p className="text-xs text-emerald-400 font-mono">
                      Establishing encrypted P2P telemedicine stream
                    </p>
                  </div>
                )}

                {/* Self PIP Viewfinder in Bottom Right */}
                <div className="absolute bottom-4 right-4 w-36 h-28 rounded-2xl border-2 border-white/80 bg-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
                  {!isVideoOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Self Off</span>
                  )}
                  <span className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[8px] font-bold text-white">
                    You
                  </span>
                </div>

                {/* Overlaid Info Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{isDoctor ? appointment.patient_name || 'Patient' : appointment.doctor_name}</span>
                </div>
              </div>

              {/* Call Controls Bar */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    isMuted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleVideo}
                  style={{ outline: 'none' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    isVideoOff ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  style={{ outline: 'none' }}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
                  title="End Video Call"
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
