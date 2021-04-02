const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const API_KEY = "effc6aa9be9027cc342841c6e0cb6081";

function fetchWeather(req, res) {
    fetch(req)
        .then(response => {
            if (response.status != 200) {
                res.statusCode = 404;
                res.send(`Can not find city`);
            } else {
                response.json()
                    .then(data => {
                        data.icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                        res.json(data);
                    })
            }
        }).catch(err => {
            res.statusCode = 400;
            res.send(`Unexpected error occured: ${err}`);
        })
}

router.get('/city', (req, res) => {
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=${API_KEY}&units=metric`;
    fetchWeather(weather_url, res);
});

router.get('/coordinates', (req, res) => {
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${API_KEY}&units=metric`;
    fetchWeather(weather_url, res);
});


module.exports = router;