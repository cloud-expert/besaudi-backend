const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const projectValidation = require('../../validations/project.validation');
const projectController = require('../../controllers/project.controller');

const router = express.Router();

router.post('/generate', validate(projectValidation.generateImage), projectController.generateImage);
router.post('/mobile', validate(projectValidation.mobileImage), projectController.mobileGenerate)

module.exports = router;
