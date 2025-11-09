/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { ReservationService } from '../services/reservationService';

const router = express.Router();
const reservationService = new ReservationService();

router.post('/', async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create reservation',
    });
  }
});

router.get('/phone/:phone', async (req, res) => {
  try {
    const reservations = await reservationService.getReservationByPhone(req.params.phone);
    res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve reservations',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found',
      });
    }
    res.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve reservation',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body);
    res.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update reservation',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id);
    res.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel reservation',
    });
  }
});

router.get('/slots/:date', async (req, res) => {
  try {
    const slots = await reservationService.getAvailableTimeSlots(req.params.date);
    res.json({
      success: true,
      data: slots,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve time slots',
    });
  }
});

export default router;
