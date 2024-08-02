const httpStatus = require('http-status');
const { Gallery } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getGallery = async (userId) => {
  return Gallery.find({ userId });
};

const getGalleryById = async (id) => {
  return Gallery.findById(id);
};

const getAllGallery = async () => {
  const gallery = await Gallery.find({});
  if (!gallery) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Gallery not found');
  }
  return gallery;
};

const createGallery = async (galleryBody) => {
  return Gallery.create(galleryBody);
};

const deleteGalleryById = async (id) => {
  const gallery = await getGalleryById(id);
  if (!gallery) {
    throw new ApiError(httpStatus.NOT_FOUND, 'gallery not found');
  }
  await gallery.remove();
  return gallery;
};

module.exports = {
  getGallery,
  getAllGallery,
  createGallery,
  deleteGalleryById,
};
