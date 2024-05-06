import schema from './utils/intakes.schema.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
import joi from 'joi';


const expect = chai.expect;


chai.use(chaiHttp);
describe('Testing properties af intakes read med validation', () => { // random string
    it('Is an array, first obj should have props x eql to x - testing heavily on one record for user 3 - if it fails then the record has been deleted :) (And yes the user and there record has been deleted so this test will proceed to fail - dont worry.)', (done) => {
        chai.request("http://localhost:3000/intakes/3").get('/').end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.have.property('intakeId').eql(5);
            expect(res.body[0]).to.have.property('mealId').eql(null);
            expect(res.body[0]).to.have.property('ingredientId').eql(4);
            expect(res.body[0]).to.have.property('weightInGrams').eql(125);
            expect(res.body[0]).to.have.property('totalKcal').eql(42);
            expect(res.body[0]).to.have.property('totalProtein').eql(243);
            expect(res.body[0]).to.have.property('totalFiber').eql(23);
            expect(res.body[0]).to.have.property('totalFat').eql(55);
            expect(res.body[0]).to.have.property('dateAndTimeOfIntake').eql("2024-04-19T12:21:22.307Z");
            expect(res.body[0]).to.have.property('lat').eql(55.675758);
            expect(res.body[0]).to.have.property('lon').eql(13.56902);
            expect(res.body[0]).to.have.property('cityName').eql("Stormalmø");

            done();
        })
    });
    it('Object properties are validated for the right types', (done) => {
        chai.request("http://localhost:3000/intakes/3").get('/').end((err, res) => {

            const { error, value } = schema.validate(res.body[0]);

            expect(error).to.be.undefined;

            done();
        })
    });
});