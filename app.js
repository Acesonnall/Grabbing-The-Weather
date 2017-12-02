'use strict';

global.appRoot = __dirname; //set the global path so other files may use it

const express = require('express'); // Require our module
const app = express(); // Instantiate our module

const bodyParser = require('body-parser');
const port = 80; // Set to port 80
const morgan = require('morgan'); // Require our server activity logger module


app.use(morgan('dev'), bodyParser.urlencoded({extended: true}), bodyParser.json());

app.use(express.static('./public')); // Serve up public folder
app.use(express.static('./node_modules/bootstrap/dist'));
app.use(express.static('./node_modules/jquery/dist'));
app.use(express.static('./node_modules/materialize-css/dist'));

require(__dirname + '/app/routes/routes.js') (app); // load our routes and pass in our app

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;