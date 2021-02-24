const express = require("express");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");

const ExpressError = require("./utils/express-error");
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

const app = express();

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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


app.get("/", (req, res) => {
    res.render("home");
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => console.log("listening on port 3000"));