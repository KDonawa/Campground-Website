const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require('../utils/catch-async');
const { reviewValidator } = require('../schemas');
const ExpressError = require("../utils/express-error");
const {isLoggedIn, isReviewOwner} = require('../middleware');


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

router.get('/', (req, res) => {
    res.redirect('/campgrounds/'+req.params.id);
})
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", isLoggedIn, isReviewOwner, catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect("/campgrounds/"+id);
}));

module.exports = router;