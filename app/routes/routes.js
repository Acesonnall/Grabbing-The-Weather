/**
 * @file Server handle for weather related client requests
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

const _viewsdir = appRoot + '/views',

    path = require('path'), // Require path module for configuring paths

    toolbox = require('../toolbox/toolbox'); // Handy dandy functions

/**********************************/
/******* APPLICATION ROUTES *******/
/**********************************/
module.exports = (app, weather) => {
    // Default URL (Front-facing page)
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(_viewsdir + '/curr_weather.html'));
    });

    // Get weather (used in AJAX call from client
    app.get('/weather', (req, res) => {
        weather.getWeather(toolbox.toTitleCase(req.query.city), toolbox.toTitleCase(req.query.country), (err, info) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err, info: info}));
        });
    });
};