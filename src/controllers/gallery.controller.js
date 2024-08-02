const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { galleryService } = require('../services');
const logger = require('../config/logger');

const fs = require('fs');

const getGallery = catchAsync(async (req, res) => {
  const gallery = await galleryService.getGallery(req.params.userId);
  if (!gallery) {
    throw new ApiError(httpStatus.NOT_FOUND, 'gallery not found');
  }
  res.send(gallery);
});

const getAllGallery = catchAsync(async (req, res) => {
  const gallery = await galleryService.getAllGallery();
  if (!gallery) {
    throw new ApiError(httpStatus.NOT_FOUND, 'gallery not found');
  }
  res.send(gallery);
});

const saveGallery = catchAsync(async (req, res) => {
  const image = crypto.randomUUID() + '.png';

  const gallery = await galleryService.createGallery({
    userId: req.body.userId,
    image,
  });

  let img = req.body.image;
  let data = img.replace(/^data:image\/\w+;base64,/, '');
  let buf = new Buffer(data, 'base64');

  fs.writeFile(`${__dirname}/../../result/${image}`, buf, (err) => {
    if (err) {
      console.error(err);
    } else {
      logger.info('Write file successfully');
    }
  });
  res.status(httpStatus.CREATED).send({ gallery });
});

const deleteGallery = catchAsync(async (req, res) => {
  await galleryService.deleteGalleryById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getGallery,
  getAllGallery,
  saveGallery,
  deleteGallery,
};
