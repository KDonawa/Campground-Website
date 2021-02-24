const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require('../utils/catch-async');
const { reviewValidator } = require('../schemas');
const ExpressError = require("../utils/express-error");



const validateReview = (req, res, next) => {
    const {error} = reviewValidator.validate(req.body);
    if(error){
        const msg = error.details
            .map(x => x.message)
            .join(", ");
        throw new ExpressError(msg, 400);
    }
    else next();
}

router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect("/campgrounds/"+id);
}));

module.exports = router;