const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds');
const {isLoggedIn, isCampgroundOwner, validateCampground} = require('../middleware');

router.route('/')
    .get(campgrounds.index)
    .post(isLoggedIn, validateCampground, campgrounds.create);

router.get("/new", isLoggedIn, campgrounds.showNewForm);

router.route("/:id")
    .get(campgrounds.showCampground)
    .put(isLoggedIn, isCampgroundOwner, validateCampground, campgrounds.updateCampground)
    .delete(isLoggedIn, isCampgroundOwner, campgrounds.deleteCampground);

router.get("/:id/edit", isLoggedIn, isCampgroundOwner, campgrounds.showEditForm);


module.exports = router;