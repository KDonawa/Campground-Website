const express = require('express');
const router = express.Router({mergeParams: true});

const reviews = require('../controllers/reviews');
const {isLoggedIn, isReviewOwner, validateReview} = require('../middleware');


router.route('/')
    .get(reviews.index)
    .post(isLoggedIn, validateReview, reviews.create);

router.delete("/:reviewId", isLoggedIn, isReviewOwner, reviews.delete);

module.exports = router;