'use strict';

const expect = require('chai').expect,
    app = require('../app'),
    server = app.listen(),
    api = require('supertest').agent(server);

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
        it('should ask for city and country if both fields are empty', done => {
            api.get('/weather?city=&country=')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    expect(res.body.err).to.be.a('string');
                    expect(res.body.err).to.equal('Please enter a city and country name.');
                    done();
                });
        });

        it('should ask for city if city field is empty', done => {
            api.get('/weather?city=&country=China')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    expect(res.body.err).to.be.a('string');
                    expect(res.body.err).to.equal('Please enter a city name.');
                    done();
                });
        });

        it('should ask for country if country field is empty', done => {
            api.get('/weather?city=Zhengzhou&country=')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    expect(res.body.err).to.be.a('string');
                    expect(res.body.err).to.equal('Please enter a country name.');
                    done();
                });
        });

        it('should report location not found if input doesn\'t match database values', async () => {
            const res = await api.get('/weather?city=Isle%20Delfine&country=Paradise')
                .set('Accept', 'application/json')
                .expect(200);

            expect(res.body.err).to.be.a('string');
            expect(res.body.err).to.equal('Location not supported.');
        });

        it('should report weather information if no prior errors', done => {
            api.get('/weather?city=Zhengzhou&country=China')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    expect(res.body.info).to.have.property('city');
                    expect(res.body.info.city).to.be.a('string');
                    expect(res.body.info).to.have.property('fahrenheit');
                    expect(res.body.info.fahrenheit).to.be.a('number');
                    expect(res.body.info).to.have.property('celsius');
                    expect(res.body.info.celsius).to.be.a('number');
                    done();
                });
        });
    });
});