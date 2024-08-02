const Joi = require('joi');

const generateImage = {
  body: Joi.object().keys({
    source: Joi.string().required(),
    target: Joi.string().required(),
  }),
};

const mobileImage = {
  body: Joi.object().keys({
    source: Joi.string().required(),
    target: Joi.string().required()
  })
}

module.exports = {
  generateImage,
  mobileImage
};
