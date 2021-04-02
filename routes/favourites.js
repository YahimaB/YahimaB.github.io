const express = require('express');
const router = express.Router();
const City = require('../models/City');


//Get all cities
router.get('/', async(req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (err) {
        res.statusCode = 400;
        res.json({ message: err });
    }
});

//Get specific city
router.get('/', async(req, res) => {
    try {
        const city = await City.find({ name: req.query.name });
        res.json(city);
    } catch (err) {
        res.json({ message: err });
    }
});

//Add new city
router.post('/', async(req, res) => {
    console.log(req.body);

    const city = await City.find({ name: req.query.name });
    if (city.length == 0) {
        const city = new City({
            name: req.query.name
        });

        const savedCity = await city.save();
        try {
            res.json(savedCity);
        } catch (err) {
            res.json({ message: err });
        }
    } else {
        res.status(409).send("City alredy exists");
    }
})

//Delete city
router.delete('/', async(req, res) => {
    try {
        const city = await City.remove({ name: req.query.name });
        res.json(city);
    } catch (err) {
        res.statusCode = 404;
        res.json({ message: err });
    }
});

module.exports = router;