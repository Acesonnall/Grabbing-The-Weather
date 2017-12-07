/**
 * @file BDD style testing with Chai
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

'use strict';

const expect = require('chai').expect, // BDD assertion
    app = require('../app').app, // The application
    server = app.listen(), // The server instance
    api = require('supertest').agent(server), // HTTP testing instance
    Weather = require('../app/weather/weather').Weather; // Weather class


describe('Internal', () => {
    describe('API Key', () => {
        it('should throw error if no api key exists', async () => {
            new Weather(undefined, appRoot + '/public/files/city.list.json', err => expect(err).to.be.a('string').that.equals('No API key input.'));
        });

        it('should throw error if api key is invalid', async () => {
            new Weather('0cc175b9c0f1b6a8', appRoot + '/public/files/city.list.json', err => expect(err).to.be.a('string').that.equals('Invalid API key.'));
        });

        it('should set api key if no errors exist', async () => {
            const w = await new Weather('0cc175b9c0f1b6a831c399e269772661', appRoot + '/public/files/city.list.json', err => expect(err).to.be.undefined);

            expect(w).to.be.an('object');
            expect(w.apikey).to.be.a('string');
        });
    });

    describe('City list file', async () => {
        it('should throw error if no file destination inputted', async () => {
            new Weather('0cc175b9c0f1b6a831c399e269772661', undefined, err => expect(err).to.be.a('string').that.equals('No file input.'));
        });

        it('should throw ENOENT error if file not found', async () => {
            new Weather('0cc175b9c0f1b6a831c399e269772661', appRoot + '/public/files/city.list.txt', err => expect(err).to.be.a('string').that.contains('ENOENT'));
        });

        it('should populate city list if no errors', async () => {
            const w = await new Weather('0cc175b9c0f1b6a831c399e269772661', appRoot + '/public/files/city.list.json', err => {
                expect(err).to.be.undefined;
            });

            expect(w).to.be.an('object');
            expect(w.cityList).to.be.an('array');
        });
    });
});

describe('User', () => {
    after(done => {
        server.close();
        done();
    });

    describe('GET /', () => {
        it('should return a 200 response', done => {
            api.get('/')
                .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
                .expect(200, done);
        });
    });

    describe('GET /weather', () => {
        it('should ask for city and country if both fields are empty', async () => {
            const res = await api.get('/weather?city=&country=')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.err).to.be.a('string');
            expect(res.body.err).to.equal('Please enter a city and country name.');
        });

        it('should ask for city if city field is empty', async () => {
            const res = await api.get('/weather?city=&country=China')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.err).to.be.a('string');
            expect(res.body.err).to.equal('Please enter a city name.');
        });

        it('should ask for country if country field is empty', async () => {
            const res = await api.get('/weather?city=Zhengzhou&country=')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.err).to.be.a('string');
            expect(res.body.err).to.equal('Please enter a country name.');
        });

        it('should report location not found if input doesn\'t match database values', async () => {
            const res = await api.get('/weather?city=Isle%20Delfine&country=Paradise')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.err).to.be.a('string');
            expect(res.body.err).to.equal('Location not supported.');
        });

        it('should report weather information if no prior errors regardless of casing', async () => {
            const res = await api.get('/weather?city=mIAmi&country=uniTED%20sTaTeS')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.info).to.have.property('city');
            expect(res.body.info.city).to.be.a('string');
            expect(res.body.info).to.have.property('fahrenheit');
            expect(res.body.info.fahrenheit).to.be.a('number');
            expect(res.body.info).to.have.property('celsius');
            expect(res.body.info.celsius).to.be.a('number');
        });
    });
});