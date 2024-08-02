const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const projectSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
    },
    source: {
      type: String,
    },
    target: {
      type: String,
    },
    source_index: {
      type: Number,
      default: -1,
    },
    target_index: {
      type: Number,
      default: -1,
    },
    background_enhance: {
      type: Boolean,
      default: true,
    },
    face_restore: {
      type: Boolean,
      default: true,
    },
    face_upsample: {
      type: Boolean,
      default: true,
    },
    upscale: {
      type: Number,
      default: 1,
    },
    codeformer_fidelity: {
      type: Number,
      default: 0.5
    },
    output_format: {
      type: String,
      default: 'JPEG'
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
