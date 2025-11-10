/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { ReservationAdapter } from '../interfaces/reservationAdapter';

const router = express.Router();
const reservationRepository = new ReservationRepository();

router.post('/', async (req, res) => {
  try {
    const { guestName, phoneNumber, partySize, reservationDate, reservationTime } = req.body;

    const reservation = await reservationRepository.create(
      guestName,
      phoneNumber,
      partySize,
      new Date(reservationDate),
      reservationTime
    );

    res.json({
      success: true,
      data: ReservationAdapter.toDTO(reservation),
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
    const reservations = await reservationRepository.findByPhone(req.params.phone);
    res.json({
      success: true,
      data: reservations.map(r => ReservationAdapter.toDTO(r)),
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
    const reservation = await reservationRepository.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found',
      });
    }
    res.json({
      success: true,
      data: ReservationAdapter.toDTO(reservation),
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
    const { partySize, reservationDate, reservationTime } = req.body;

    const reservation = await reservationRepository.updateReservation(
      req.params.id,
      partySize,
      reservationDate ? new Date(reservationDate) : undefined,
      reservationTime
    );

    res.json({
      success: true,
      data: ReservationAdapter.toDTO(reservation),
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
    const reservation = await reservationRepository.cancelReservation(req.params.id);
    res.json({
      success: true,
      data: ReservationAdapter.toDTO(reservation),
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
    const slots = await reservationRepository.getAvailableTimeSlots();
    res.json({
      success: true,
      data: slots.map(s => ({
        time: s.time,
        available: s.isAvailable()
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve time slots',
    });
  }
});

export default router;
