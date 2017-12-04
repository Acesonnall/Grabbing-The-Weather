/**
 * @file Server handle for weather related client requests
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

const _viewsdir = appRoot + '/views',
    _publicdir = appRoot + '/public',

    fs = require('fs'), // Require module for interacting with file system
    path = require('path'), // Require path module for configuring paths
    countrynames = require('countrynames'), // Require module to resolve country names
    request = require('request'); // Require module to make HTTP requests

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

    // Search for matching city and country values in our database
    fs.readFile(_publicdir + '/files/city.list.json', (err, data) => {
        // Handle file reading error (should not happen)
        if (err) {
            console.log(err); // Log
            return weatherNotFound('There was an internal error. Please try again later.'); // report and return
        }

        let found = false; // State variable

        const list = JSON.parse(data); // Parse binary into JSON object

        // Iterate through JSON array
        for (let i = 0; i < list.length; i++) {

            // User provided city and country values exist with list?
            if (list[i].name === city && list[i].country === (country.length < 3 ? country : countrynames.getCode(country))) {
                found = true; // Got 'em

                // Request weather information with OpenWeatherMap API
                request('https://api.openweathermap.org/data/2.5/weather?id=' + list[i].id + '&APPID=5879e860962b07734fc97566d05adacc', {json: true}, (err, res, body) => {
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
    });
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
        getWeather(req.query.city, req.query.country, (err, info) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err, info: info}));
        });
    });
};