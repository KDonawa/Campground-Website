const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundValidator } = require('./schemas');
const ExpressError = require("./utils/express-error");

module.exports = {
    isLoggedIn: (req, res, next) => {
        if(!req.isAuthenticated()){
            req.session.returnTo = req.originalUrl;
            req.flash('error', 'You must be signed in first!');
            return res.redirect('/login');
        }
        next();
    },
    isCampgroundOwner: async (req, res, next) => {
        const {id} = req.params;

        if(req.isAuthenticated()){
            const campground = await Campground.findById(id);
            if(campground && campground.author.equals(req.user._id)){          
                return next();
            }
        }
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/campgrounds/'+id);
    },
    isReviewOwner: async (req, res, next) => {
        const {id, reviewId} = req.params;

        if(req.isAuthenticated()){
            const review = await Review.findById(reviewId);
            if(review && review.author.equals(req.user._id)){
                return next();
            }
        }
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/campgrounds/'+id);
    },
    validateCampground : (req, res, next) => {
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
    }
};