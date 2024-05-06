import chai from "chai";
import chaiHttp from "chai-http";
let server = 'http://localhost:3000';

chai.should();
chai.use(chaiHttp);


/*
Her er den simpleste funktion til at udregne basalstofskiftet. 
Den er kun i dette dokument og den bliver brugt hver gang en bruger logger ind
til at udregne deres basalstofskifte pr dags dato. 
Brugeren skal selv sørger for at deres oplysninger ift. vægt og alder er opdateret. 
*/ 
function udregnBslss(weight, multiplyFactor, rightNumber) {

  return weight * multiplyFactor + parseFloat(rightNumber);
};
/*
Her er endnu en funktion som simpelthen også udregner ens alder i år! 
Den bliver brugt til at udregne basalstofskiftet.
Den går et år tilbage. F.eks. er man 11 år og 9 måneder så er man i vores system 11 år.
*/
function calculateAge(birthDate) {
  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  let monthDif = today.getMonth() - birthDate.getMonth();

  if (monthDif < 0) {
      age = age - 1;
  } else if (monthDif == 0 && today.getDate() < birthDate.getMonth()) {
      age = age - 1;
  }

  return age;
}

describe('calculateAge', () => {
  it('should calculate the age correctly when the birth date is in the past', () => {
    const birthDate = new Date('1990-01-01');
    const today = new Date();

    const age = calculateAge(birthDate);
    const expectedAge = today.getFullYear() - birthDate.getFullYear();
    chai.expect(age).to.equal(expectedAge);
  });

  it('should calculate the age to 10 if you are 10 years and 3 months', () => {
    const birthDate = new Date('2014-01-24');

    const age = calculateAge(birthDate);
    const expectedAge = 10;
    chai.expect(age).to.equal(expectedAge);
  });

});

describe('udregnBslss', () => {
  it('It should give me the blss value 6.04 if you weigh 50 and you are a 20 years old man', () => {
    const weight = 50;
    const multiplyFactor = 0.064;
    const rightNumber = "+2.84";
    const expectedBslss = 6.04;

    const bslss = udregnBslss(weight, multiplyFactor, rightNumber);
    chai.expect(bslss).to.equal(expectedBslss);
  });
});



/*  Mislykket forsøg på at teste user functionality*/
/*
describe("testing if user can be created, updated and deleted", () => {
  it("It should create a user", (done) => {
    // setup 
    const email = 'test5@mail.dk';
    const pwd = "test";
    const uName = "test";
    const weight = 100;
    const dateOfBirth = "2021-01-01";
    const gender = "M"; 

    // setup
    const updatedUser = {email: 'updated@mail.dk', pwd: "updated", uName: "updated", weight: 120};
    

  it("It should create a user", (done) => {
      // exercise
      chai.request(server)               
          .post(`/users/signup`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({email, pwd, uName, weight, dateOfBirth, gender})
          .redirects(0)
          .end((err, response) => {
            // verify  
            response.should.have.status(302); 
            
          done();
      });
  });
});
}); */

    /* mislykkede forsøg på at teste */
    /* it("It should login a user, update og delete the user", (done) => {
      // exercise
      let agent = chai.request.agent(server);          
      agent.post(`/users/login`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({email, pwd})
          .redirects(0)
          .then( async (err, response1) => {
            // verify  
            response1.should.have.status(302);
    
            return agent.post('/users/updateUser')
            .send(updatedUser)
            .redirects(0)
            .then(async function(response2) { 
              response2.should.have.status(302);
    
              return agent.post('/users/deleteUser')
              .redirects(0)
              .then(async function(response3) {
                response3.should.have.status(302);
    
                done();
               });
            })
          });
    }); */
  
