const express = require('express');
const router = express.Router();
const multer = require('multer');

const {storage} = require('../cloudinary/index');
const campgrounds = require('../controllers/campgrounds');
const {isLoggedIn, isCampgroundOwner, validateCampground} = require('../middleware');

const upload = multer({storage});

router.route('/')
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array('image'), validateCampground, campgrounds.create);

router.get("/new", isLoggedIn, campgrounds.showNewForm);

router.route("/:id")
    .get(campgrounds.showCampground)
    .put(isLoggedIn, isCampgroundOwner, upload.array('image'), validateCampground, campgrounds.updateCampground)
    .delete(isLoggedIn, isCampgroundOwner, campgrounds.deleteCampground);

router.get("/:id/edit", isLoggedIn, isCampgroundOwner, campgrounds.showEditForm);


module.exports = router;