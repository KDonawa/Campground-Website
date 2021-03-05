const User = require('../models/user');
const catchAsync = require('../utils/catch-async');

module.exports.showRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.register = catchAsync(async (req, res) => {
    try {
        const {email, username, password} = req.body;

        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });         
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    } 
});

module.exports.showLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    req.flash('success', 'Welcome back!');
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success', 'Logged out');
    res.redirect('/');
};