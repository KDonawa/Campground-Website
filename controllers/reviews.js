const Campground = require('../models/campground');
const Review = require("../models/review");
const catchAsync = require('../utils/catch-async');

module.exports.index = (req, res) => {
    res.redirect('/campgrounds/'+req.params.id);
};

module.exports.create = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect("/campgrounds/"+id);
})