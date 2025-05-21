import {Router} from 'express';
import contactController from '../controllers/contactController.js';
const router = Router();

router.post ('/contacts', contactController.createContact);
router.get ('/contacts', contactController.getAllContacts);
router.get ('/contacts/:id', contactController.getContactById);
router.put ('/contacts/:id', contactController.updateContact);
router.delete ('/contacts/:id', contactController.deleteContact);
router.get ('/status', contactController.getStatus);

export default router;