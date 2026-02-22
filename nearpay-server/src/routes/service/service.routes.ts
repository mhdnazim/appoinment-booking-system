import { Router } from 'express';
import {
    createService,
    deleteService,
    getAllServices,
    getServiceById,
    getServicesByProvider,
    updateService
} from '../../controllers/service/service.controller';
import { validateCreateService, validateUpdateService } from '../../validations/service/service.validation';

const router = Router();

router.post('/', validateCreateService, createService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.get('/provider/:providerId', getServicesByProvider);
router.put('/:id', validateUpdateService, updateService);
router.delete('/:id', deleteService);

export default router;
