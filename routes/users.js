const express = require('express');
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
            await User.register(user, password);
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        } catch (error) {
            req.flash('error', error.message);
            res.redirect('/register');
        } 
    }))
;

module.exports = router;