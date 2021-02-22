const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");

const Campground = require("./models/campground");
const Review = require("./models/review");
const catchAsync = require('./utils/catch-async');
const ExpressError = require("./utils/express-error");
const {campgroundSchema, reviewSchema} = require('./schemas');

const app = express();

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost:27017/yelp-camp", { 
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true,
    useFindAndModify: false 
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function ()
{
    console.log("Database connected");
});

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
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

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details
            .map(x => x.message)
            .join(", ");
        throw new ExpressError(msg, 400);
    }
    else next();
}

app.get("/", (req, res) => {
    res.render("home");
});

app.route('/campgrounds')
    .get(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", {campgrounds});
    })
    .post(validateCampground, catchAsync(async (req, res) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect("/campgrounds/"+campground._id);    
    }));

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");    
});

app.route("/campgrounds/:id")
    .get(catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/show", {campground});
    }))
    .put(validateCampground, catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        res.redirect("/campgrounds/"+campground._id);    
    }))
    .delete(catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");    
    }));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground});
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await Promise.all([review.save(), campground.save()]);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => console.log("listening on port 3000"));