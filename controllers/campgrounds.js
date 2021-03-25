const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN});

const Campground = require("../models/campground");
const catchAsync = require('../utils/catch-async');
const {cloudinary} = require('../cloudinary');



module.exports.index = catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

module.exports.showNewForm = (req, res) => {  
    res.render("campgrounds/new");    
};

module.exports.create = catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(x => ({url: x.path, filename: x.filename}));
    await campground.save();
    //console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect("/campgrounds/"+campground._id);    
});

module.exports.showCampground = catchAsync(async (req, res) => {
    const campground = await Campground
        .findById(req.params.id)
        .populate({path: 'reviews', populate:{path:'author'}})
        .populate('author');

    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", {campground});
});

module.exports.showEditForm = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground});
});

module.exports.updateCampground = catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});

    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    const images = req.files.map(x => ({url: x.path, filename: x.filename}));
    campground.images.push(...images);
    await campground.save();
    if(req.body.deleteImages){
        for (const filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename:{$in: req.body.deleteImages}}}});
        console.log(campground);
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect("/campgrounds/"+campground._id);    
});

module.exports.deleteCampground = catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect("/campgrounds");    
})