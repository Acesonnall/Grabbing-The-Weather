/**
 * @file Application entry point/Server configuration
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

global.appRoot = __dirname; //set the global path so other files may use it

const express = require('express'), // Require our module
    app = express(), // Instantiate our module

    compression = require('compression'), // Require compression module
    bodyParser = require('body-parser'), // Parses incoming request bodies (made available in req.body)
    port = 80, // Set to port 80
    morgan = require('morgan'), // Require our server activity logger module
    minifyHTML = require('express-minify-html'); // Require HTML minification module for faster load times (Not useful for this application, but good practice)

app.use(compression(), morgan('dev'), bodyParser.urlencoded({extended: true}), bodyParser.json()); // Attach middleware

// Configure minification module
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));

app.use(express.static('./public')); // Serve up public folder
app.use(express.static('./node_modules/bootstrap/dist')); // Serve up bootstrap folder
app.use(express.static('./node_modules/jquery/dist')); // Serve up jquery folder
app.use(express.static('./node_modules/materialize-css/dist')); // Server up fancy external css and js folder

require(__dirname + '/app/routes/routes.js')(app); // load our routes and pass in our app

// Start server (check for parent for testing purposes)
if (!module.parent) {
    app.listen(port, () => {
        console.log("Listening on port " + port); // Successfully started (not checking for errors)
    });
}

module.exports = app; // For testing purposes