const joi = require('joi');

module.exports = {
    campgroundValidator: joi.object({
        campground: joi
            .object({
                title: joi.string().required(),
                price: joi.number().required().min(0),
                image: joi.string().required(),
                location: joi.string().required(),
                description: joi.string().required(),
            })
            .required(),
    }),
    reviewValidator: joi.object({
        review: joi
            .object({
                rating: joi.number().required().min(1).max(5),
                body: joi.string().required(),
            })
            .required(),
    }),
};