/**
 * @file Server handle for weather related client requests
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

const _viewsdir = appRoot + '/views',

    path = require('path'), // Require path module for configuring paths
    countrynames = require('countrynames'), // Require module to resolve country names
    request = require('request'), // Require module to make HTTP requests

    toolbox = require('../toolbox/toolbox'), // Handy dandy functions
    list = require('../../app').list, // List of Cities
    apikey = process.env.APIKEY;

/**
 *
 * @param city Given city (Full name)
 * @param country Given country (Two character code or full name)
 * @param cb callback
 */
function getWeather(city, country, cb) {

    /**
     * Send error message to callback if weather information is ultimately not found.
     * @param s The string message
     */
    function weatherNotFound(s) {
        cb(s);
    }

    /**
     * Send temperature information to callback if weather information is found.
     * @param temp The temperature value in Kelvin
     * @param city The given city
     */
    function weatherFound(temp, city) {
        cb(null, {
            city: city,
            fahrenheit: Math.round(9 / 5 * (temp - 273) + 32),
            celsius: Math.round(temp - 273)
        });
    }

    // Repeat client-side form checks for further security (client scripts can be edited)
    if (!(city || country))
        return weatherNotFound('Please enter a city and country name.');
    else if (!city)
        return weatherNotFound('Please enter a city name.');
    else if (!country)
        return weatherNotFound('Please enter a country name.');

    let found = false; // State variable

    // Iterate through JSON array
    for (let i = 0; i < list.length; i++) {

        // User provided city and country values exist with list?
        if (list[i].name === city && list[i].country === (country.length < 3 ? country : countrynames.getCode(country))) {
            found = true; // Got 'em

            // Request weather information with OpenWeatherMap API
            request('https://api.openweathermap.org/data/2.5/weather?id=' + list[i].id + '&APPID=' + apikey, {json: true}, (err, res, body) => {
                // Request failed (should not happen)
                if (err) {
                    console.log(err); // Log
                    return weatherNotFound('Unable to fetch weather. Please try again later'); // report and return
                }

                weatherFound(body.main.temp, city); // Send weather information to client
            });

            break; // End loop (efficiency)
        }
    }

    // No errors and reached end of loop?
    if (!found)
        weatherNotFound('Location not supported.');
}

/**********************************/
/******* APPLICATION ROUTES *******/
/**********************************/
module.exports = app => {
    // Default URL (Front-facing page)
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(_viewsdir + '/curr_weather.html'));
    });

    // Get weather (used in AJAX call from client
    app.get('/weather', (req, res) => {
        getWeather(toolbox.toTitleCase(req.query.city), toolbox.toTitleCase(req.query.country), (err, info) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err, info: info}));
        });
    });
};