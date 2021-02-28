const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catch-async');

router.route('/register')
    .get((req, res) => {
        res.render('users/register');
    })
    .post(catchAsync(async (req, res) => {
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
    }));

router.route('/login')
    .get((req, res) => {
        res.render('users/login');
    })
    .post(
        passport.authenticate('local', 
        {
            failureFlash: true,
            failureRedirect: '/login',
        }), 
        (req, res) => {
            req.flash('success', 'Welcome back!');
            res.redirect('/campgrounds');
        }    
    );

router.route('/logout')
    .get((req, res) => {
        req.logOut();
        req.flash('success', 'Logged out');
        res.redirect('/');
    })

module.exports = router;