const express = require('express');
const passport = require('passport');
const router = express.Router();

const users = require('../controllers/users');

router.route('/register')
    .get(users.showRegisterForm)
    .post(users.register);

router.route('/login')
    .get(users.showLoginForm)
    .post(
        passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), 
        users.login
    );

router.get('/logout', users.logout);

module.exports = router;