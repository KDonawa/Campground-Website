const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const campgroundSchema = new Schema({
    title: String,
    images: [{url: String, filename: String}],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
});

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if(campground){
        await Review.deleteMany({_id: {$in: campground.reviews}});
    }
})

module.exports = mongoose.model("Campground", campgroundSchema);

