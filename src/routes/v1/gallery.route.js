const express = require('express');
const galleryController = require('../../controllers/gallery.controller');

const router = express.Router();

router.route('/').get(galleryController.getAllGallery).post(galleryController.saveGallery);

router.route('/:userId').get(galleryController.getGallery).delete(galleryController.deleteGallery);

module.exports = router;
