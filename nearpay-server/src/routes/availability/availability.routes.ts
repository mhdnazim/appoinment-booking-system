import { Router } from 'express';
import {
    createAvailability,
    deleteAvailability,
    getAvailabilityByProvider,
    updateAvailability
} from '../../controllers/availability/availability.controller';
import { validateCreateAvailability, validateUpdateAvailability } from '../../validations/availability/availability.validation';

const router = Router();

router.post('/', validateCreateAvailability, createAvailability);
router.get('/:providerId', getAvailabilityByProvider);
router.put('/:providerId', validateUpdateAvailability, updateAvailability);
router.delete('/:providerId', deleteAvailability);

export default router;
