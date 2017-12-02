'use strict';

const _viewsdir = appRoot + '/views';
const _filesdir = appRoot + '/files';
const _publicdir = appRoot + '/public';

const fs = require('fs'); // Require module for interacting with file system
const path = require('path'); // Require path module for configuring paths
const countrynames = require('countrynames');
const request = require('request');

/**
 *
 * @param city Given city (Full name)
 * @param country Given country (Two character code or full name)
 * @param cb callback
 */
function getWeather(city, country, cb) {

    /**
     *
     * @param s The string message
     */
    function weatherNotFound(s) {
        cb(s);
    }

    /**
     *
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

    if (!city || !country)
        return weatherNotFound('Please enter a city and/or country.');

    fs.readFile(_publicdir + '/files/city.list.json', (err, data) => {
        if (err) {
            console.log(err);
            return weatherNotFound('There was an error. Please try again later.');
        }

        let found = false;

        const list = JSON.parse(data);

        for (let i = 0; i < list.length; i++) {
            if (list[i].name === city && list[i].country === (country.length < 3 ? country : countrynames.getCode(country))) {
                found = true;
                request('https://api.openweathermap.org/data/2.5/weather?id=' + list[i].id + '&APPID=5879e860962b07734fc97566d05adacc', {json: true}, (err, res, body) => {
                    if (err) {
                        console.log(err);
                        return weatherNotFound('There was an error. Please try again later');
                    }

                    return weatherFound(body.main.temp, city);
                });

                break;
            }
        }

        if (!found)
            return weatherNotFound('Location not supported.');
    });
}

module.exports = app => {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(_viewsdir + '/curr_weather.html'));
    });


    app.get('/weather', (req, res) => {
        getWeather(req.query.city, req.query.country, (err, info) => {
            if (err) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(err));
            } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(info));
            }
        });
    });
};