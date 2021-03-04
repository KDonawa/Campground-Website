const mongoose = require("mongoose");
const Campground = require("../models/campground");
const hubs = require("./hubs");
const {descriptors, places} = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", { 
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true 
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function ()
{
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random()*array.length)];

async function seedDB(){
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30) + 1;
        const hub = hubs[random1000];
        const camp = new Campground({
            author: '603ad1615d8cb1414c7d2e33',
            location:`${hub.city}, ${hub.state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, modi aperiam? Pariatur id accusantium maxime! Rem ullam consectetur laboriosam minima iure amet cupiditate, doloribus repellendus, aliquid omnis quasi possimus officia.',
            price
        });
        await camp.save();
    };
};

seedDB().then(() => mongoose.connection.close());