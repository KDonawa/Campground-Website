const express = require('express');
const router = express.Router();

const Campground = require("../models/campground");
const catchAsync = require('../utils/catch-async');
const { campgroundValidator } = require('../schemas');
const ExpressError = require("../utils/express-error");

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
    .post(validateCampground, catchAsync(async (req, res) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect("/campgrounds/"+campground._id);    
    }));

router.get("/new", (req, res) => {
    res.render("campgrounds/new");    
});

router.route("/:id")
    .get(catchAsync(async (req, res) => {
        const campground = await Campground
            .findById(req.params.id)
            .populate('reviews');
        res.render("campgrounds/show", {campground});
    }))
    .put(validateCampground, catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        res.redirect("/campgrounds/"+campground._id);    
    }))
    .delete(catchAsync(async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");    
    }));

router.get("/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground});
}));



module.exports = router;