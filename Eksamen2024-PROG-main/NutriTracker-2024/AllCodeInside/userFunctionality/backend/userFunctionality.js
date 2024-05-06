import express from 'express';
import bcrypt from 'bcrypt';

import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';


const saltRounds = 10;
const routes = express.Router();

// database initiation
const database = new Database(config);

/*
Her er den simpleste funktion til at udregne basalstofskiftet. 
Den er kun i dette dokument og den bliver brugt hver gang en bruger logger ind
til at udregne deres basalstofskifte pr dags dato. 
Brugeren skal selv sørge for at deres oplysninger ift. vægt og alder er opdateret. 
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

// -------------- //
// --- routes --- //
// -------------- //
routes.post('/login', async (req, res) => {
    const { email, pwd } = req.body;

    const userInfo = await database.readUser(email);

    if (!userInfo) {
        return res.status(401).send('Invalid username' + '<script>' + 'setTimeout(() => {history.back();}, 2000);' + '</script>');
    }

    // comparing hashed with password
    bcrypt.compare(pwd, userInfo.pwd, async (err, result) => {
        if (err || !result) {
            return res.status(401).send('Invalid password' + '<script>' + 'setTimeout(() => {history.back();}, 2000);' + '</script>');
        }

        req.session.regenerate(async function (err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error');
            }

            req.session.userId = userInfo.userId;
            req.session.loggedIn = true;

            req.session.save(async function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error');
                }
                let userAge = calculateAge(userInfo.dateOfBirth);

                const { multiplyFactor, rightNumber } = await database.readBsls(userAge, userInfo.gender);

                const bsls = udregnBslss(userInfo.weight, multiplyFactor, rightNumber);

                const message = await database.updateUserBsls(userInfo.userId, bsls);

                console.log(message);
                res.redirect('../dailyNutri/DailyNutri.html');
            })
        })


    });
});

routes.post('/signup', async (req, res) => {
    const data = req.body;

    // checking if the user is at least 1 year old
    const date = new Date(data.dateOfBirth);
    const todayDate = new Date();
    if ((todayDate - date) / (1000 * 3600 * 24 * 365) < 1 || (todayDate - date) / (1000 * 3600 * 24 * 365) > 101) {
        res.status(400).send('<h2>You have to be at least 1 year old</h2>' +
        '<script>' + 'setTimeout(() => {history.back();}, 3000);' + '</script>');
    }

    bcrypt.hash(data.pwd, saltRounds, async function (err, hash) {
        if (err) {
            console.log(err)
        } else {
            data.pwd = hash;

            try {
                const message = await database.createUser(data);
                if (message === 1) {
                    res.status(201);
                    res.redirect('/usersFront/login.html');
                } else {
                    res.status(502).send('Database error');
                }

            }
            catch (err) {
                console.error(err)
                res.status(500).send('Error');
            }
        }
    });

});

routes.post('/logout', async (req, res) => {
    // destroy the session
    req.session.userId = null;
    req.session.loggedIn = false;

    // save the session so the user is logged out
    // the session ID can then be reused
    req.session.save(function (err) {
        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
            if (err) {
                console.log(err)
                res.status(500).send('Error')
            }
            res.redirect('/usersFront/login.html');
        })
    })

});

routes.post('/updateUser', async (req, res) => {
    let message = '';
    const ID = req.session.userId;

    // checking if the user is at least 1 year old
    const date = new Date(req.body.dateOfBirth);
    const todayDate = new Date();
    if ((todayDate - date) / (1000 * 3600 * 24 * 365) < 1 || (todayDate - date) / (1000 * 3600 * 24 * 365) > 101) {
        res.status(400).send(
            '<h2>You have to be at least 1 year old</h2>' +
            '<script>' + 'setTimeout(() => {history.back();}, 3000);' + '</script>'
        );
        return;
    }

    if (req.body.pwd !== '') {
        bcrypt.hash(req.body.pwd, saltRounds, async (err, hash) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error');
            } else {
                req.body.pwd = hash;
                try {
                    message = await database.updateUser(ID, req.body);
                }   catch (err) {
                    console.error(err);
                    res.status(500).send('Error, user not updated by password');
                }
            }
        });
    } else if (req.body.pwd == '') {
        try {
            message = await database.updateUser(ID, req.body);
        }   catch (err) {
            console.error(err);
            res.status(500).send('Error, user not updated');
        }
        
    }

    if (message === 0) {
        res.status(500).send('Error, user not updated');
    }
    
    // destroy the session
    req.session.userId = null;
    req.session.loggedIn = false;

    // save the session so the user is logged out
    req.session.save(function (err) {
        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
            if (err) {
                console.log(err)
                res.status(500).send('Error')
            }
            res.redirect('/usersFront/login.html');
        })
    })

});

routes.post('/deleteUser', async (req, res) => {
    const ID = req.session.userId;
    const message = await database.deleteUser(ID);

    console.log(message);
    req.session.destroy();
    res.redirect('/usersFront/login.html');
});

routes.get('/getusername', async (req, res) => {
    const ID = req.session.userId;
    const userName = await database.readUserNameById(ID);
    res.status(200).json(userName);
}); 

export { routes as userFunctionality };