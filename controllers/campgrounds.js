const Campground = require("../models/campground");
const catchAsync = require('../utils/catch-async');

module.exports.index = catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

module.exports.showNewForm = (req, res) => {  
    res.render("campgrounds/new");    
};

module.exports.create = catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    campground.images = req.files.map(x => ({url: x.path, filename: x.filename}));
    await campground.save();
    console.log(campground.images);
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
    req.flash('success', 'Successfully updated campground!');
    res.redirect("/campgrounds/"+campground._id);    
});

module.exports.deleteCampground = catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect("/campgrounds");    
})