const Campground = require("./models/campground");

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

        if(req.isAuthenticated() && id){
            const campground = await Campground.findById(id);
            if(campground && campground.author.equals(req.user._id)){          
                return next();
            }
        }
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/campgrounds');
    },
};