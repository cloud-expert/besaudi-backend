const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const logger = require('../config/logger');

const gallerySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
// gallerySchema.plugin(toJSON);
// gallerySchema.plugin(paginate);

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
