/**
 * Doctor API Routes
 */
import express from 'express';
import {
  getAllDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  callNextPatient,
  getDoctorSlots,
  createDoctorSlots,
  getConsultationMessages,
  sendConsultationMessage,
  getCallSignal,
  updateCallSignal,
  getDoctorLiveWorkload,
  bookDoctorAppointment,
} from '../controllers/doctorController.js';

const router = express.Router();

// Public doctor discovery
router.get('/', getAllDoctors);
router.get('/:id', getDoctorProfile);

// Real-time doctor workload & busy/on-call telemetry
router.get('/:id/workload', getDoctorLiveWorkload);

// Direct patient booking backend endpoint
router.post('/book', bookDoctorAppointment);

// Doctor profile management (edit / update profile details)
router.put('/:id', updateDoctorProfile);

// Doctor appointments & patient queries for schedule list
router.get('/:id/appointments', getDoctorAppointments);
router.put('/appointments/:appointmentId/status', updateAppointmentStatus);

// Live queue caller actions
router.post('/:id/call-next', callNextPatient);

// Realtime consultation messages for specific appointment room
router.get('/consultations/:appointmentId/messages', getConsultationMessages);
router.post('/consultations/:appointmentId/messages', sendConsultationMessage);

// Realtime call presence & WebRTC signaling
router.get('/consultations/:appointmentId/signal', getCallSignal);
router.post('/consultations/:appointmentId/signal', updateCallSignal);

// Doctor date/time availability slots
router.get('/:id/slots', getDoctorSlots);
router.post('/:id/slots', createDoctorSlots);

export default router;

