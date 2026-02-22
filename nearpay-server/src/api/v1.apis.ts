import { Router } from 'express';
import authRoutes from '../routes/auth/auth.routes';
import serviceRoutes from '../routes/service/service.routes';
import availabilityRoutes from '../routes/availability/availability.routes';
import bookingRoutes from '../routes/booking/booking.routes';

const router = Router();

// V1 APIs
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings', bookingRoutes);

export default router;
