import {Router} from 'express';
import bookController from '../controllers/Controller.js';
const router = Router();

router.post ('/books', bookController.createBook);
router.get ('/books', bookController.getAllBooks);
router.get ('/books/:id', bookController.getBookById);
router.put ('/books/:id', bookController.updateBook);
router.delete ('/books/:id', bookController.deleteBook);

export default router;