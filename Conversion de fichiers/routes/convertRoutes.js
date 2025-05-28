const express = require('express');
const router = express.Router();
const convertController = require('../controllers/convertController');
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });

router.post ('/convert', upload.single('file'), convertController.convertFile);
router.get ('/convert/:id', convertController.downloadConverted);
router.put ('/convert/:id', convertController.reprocessFile);
router.delete ('/convert/:id', convertController.deleteConversion);

module.exports = router;