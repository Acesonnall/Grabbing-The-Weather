/**
 * @file Weather class
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

const fs = require('fs'),
    countrynames = require('countrynames'), // Require module to resolve country names
    request = require('request'); // Require module to make HTTP requests

module.exports.Weather = class Weather {

    /**
     * Weather class instantiates with an API key and file pointer to the city list
     * @param apikey must be set as environment variable
     * @param file list of city ids
     * @param cb callback
     */
    constructor(apikey, file, cb) {
        if (!apikey)
            return cb('No API key input.');
        else if (apikey.length < 32)
            return cb('Invalid API key.');
        else
            this._apikey = apikey;
        if (!file)
            return cb('No file input.');
        else {
            try {
                this._cityList = JSON.parse(fs.readFileSync(file));
            } catch (e) {
                return cb(e.message);
            }
        }
    }

    /**
     *
     * @param city Given city (Full name)
     * @param country Given country (Two character code or full name)
     * @param cb callback
     */
    getWeather(city, country, cb) {

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
        for (let i = 0; i < this.cityList.length; i++) {

            // User provided city and country values exist with list?
            if (this.cityList[i].name === city && this.cityList[i].country === (country.length < 3 ? country : countrynames.getCode(country))) {
                found = true; // Got 'em

                // Request weather information with OpenWeatherMap API
                request('https://api.openweathermap.org/data/2.5/weather?id=' + this.cityList[i].id + '&APPID=' + this.apikey, {json: true}, (err, res, body) => {
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

    /**
     * City list getter
     * @returns {any | *}
     */
    get cityList() {
        return this._cityList;
    }

    /**
     * API key getter
     * @returns {*}
     */
    get apikey() {
        return this._apikey;
    }

    set apikey(value) {
        this._apikey = value;
    }
};