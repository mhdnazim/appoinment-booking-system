import { Router } from 'express';
import {
    createBooking,
    deleteBooking,
    getAvailableSlots,
    getBookingById,
    getBookingsByProvider,
    getBookingsByUser,
    updateBookingStatus
} from '../../controllers/booking/booking.controller';
import { validateCreateBooking, validateUpdateBookingStatus } from '../../validations/booking/booking.validation';

const router = Router();

router.post('/', validateCreateBooking, createBooking);
router.get('/available-slots', getAvailableSlots);
router.get('/:id', getBookingById);
router.get('/user/:userId', getBookingsByUser);
router.get('/provider/:providerId', getBookingsByProvider);
router.patch('/:id/status', validateUpdateBookingStatus, updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
