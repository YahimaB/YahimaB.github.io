const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

require('dotenv/config')

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

//Import Routes
const weatherRoute = require('./routes/weather');
app.use('/weather', weatherRoute);

const favouritesRoute = require('./routes/favourites');
app.use('/favourites', favouritesRoute);

//ROUTES
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});


//Connect To DB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('connected to DB!'));

//How to start listening to the server
app.listen(3000);