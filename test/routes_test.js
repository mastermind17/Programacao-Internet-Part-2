'use strict';

/**
 * This file intends to test the routes defined inside our application.
 */

const expect = require('expect.js');

/*
to be used with supertest
 */
const leagueRoutes = require("../routes/leagues");
const leagueRoutesTest = require("../routes/leagues").test;
/*
to be used without supertest.
This one gives access to the source code of the controller.
 */

//our exported app instance
const app = require('../index').app;

app.use(leagueRoutes); //use routes from leagues.js


var request = require('supertest'); //tests the technical details of the responses given by handlers.

describe('Route', function(){
    describe('/', function(){
        it('should provide html as content type', function(done){
            /*
            Simple way of testing the technical details of our handlers
            using supertest.js
             */
            request(app)
              .get('/')
              .expect('Content-Type', /html/, done);
        }),
        it('should provide 200 as status code', function(done){
           request(app).get('/').expect(200,done);
        })
    });

    describe('/leagues', function(){
        it('should have 200 as status code', function(done){
            request(app).get('/leagues')
                .expect('Content-Type', /html/)
                .expect(200, done);
        })
    });
});
