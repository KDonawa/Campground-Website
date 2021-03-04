const express = require('express');
const router = express.Router();

const Campground = require("../models/campground");
const catchAsync = require('../utils/catch-async');
const { campgroundValidator } = require('../schemas');
const ExpressError = require("../utils/express-error");
const {isLoggedIn, isCampgroundOwner} = require('../middleware');

const validateCampground = (req, res, next) => {
    const {error} = campgroundValidator.validate(req.body);
    if(error){
        const msg = error.details
            .map(x => x.message)
            .join(", ");
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};

router.route('/')
    .get(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", {campgrounds});
    })
    .post(isLoggedIn, validateCampground, catchAsync(async (req, res) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect("/campgrounds/"+campground._id);    
    }));

router.get("/new", isLoggedIn, (req, res) => {  
    res.render("campgrounds/new");    
});

router.route("/:id")
    .get(catchAsync(async (req, res) => {
        const campground = await Campground
            .findById(req.params.id)
            .populate('reviews')
            .populate('author');
        if(!campground){
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render("campgrounds/show", {campground});
    }))
    .put(isLoggedIn, isCampgroundOwner, validateCampground, catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        if(!campground){
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        req.flash('success', 'Successfully updated campground!');
        res.redirect("/campgrounds/"+campground._id);    
    }))
    .delete(isLoggedIn, isCampgroundOwner, catchAsync(async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted campground');
        res.redirect("/campgrounds");    
    }));

router.get("/:id/edit", isLoggedIn, isCampgroundOwner, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground});
}));



module.exports = router;