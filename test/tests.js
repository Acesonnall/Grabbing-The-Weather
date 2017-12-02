'use strict';

const should = require('chai').should(),
    expect = require('chai').expect,
    supertest = require('supertest'),
    server = require('../app'),
    api = supertest(server);

let testPassed = 0;

function testsFinished(number, server) {
    if (number === 3)
        server.close();
}

describe('User', () => {
    describe('GET /', () => {
        it('should return a 200 response', done => {
            api.get('/')
                .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
                .expect(200, done);
            testsFinished(++testPassed, server);
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
                  testsFinished(++testPassed, server);
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
                    testsFinished(++testPassed, server);
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
                    testsFinished(++testPassed, server);
                });
        });
    });
});