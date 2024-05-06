// general installation
import express from 'express';
import cors from 'cors';
/* import morgan from 'morgan'; */
import session from 'express-session';
import path, { dirname } from 'path'; // Vi skal bruge path til at finde frontend mappen -> frontend mappen er i en anden mappe end serveren, men jeg har problemer med at få det til at virke.
/* import bcrypt from 'bcrypt'; */
import parseurl from 'parseurl';

// files import
import { config } from './config.js';
import {intakes} from '../mealTracker/backend/intakes.js';
import {userFunctionality} from '../userFunctionality/backend/userFunctionality.js';
import {waterRegs} from '../mealTracker/backend/waterRegs.js';
import {ingredients} from '../mealCreator/backend/ingredients.js';
import {meals} from '../mealCreator/backend/mealCreator.js';
import {activities} from '../activityTracker/backend/activity.js';
import {user_activities} from '../activityTracker/backend/userActivity.js';
import {dailiesForUser} from '../dailyNutri/backend/dailiesForUser.js';



const app = express();
const PORT = process.env.PORT || 3000;
const store = new session.MemoryStore();
let loggedinUsers = 0;

// general settings
/* app.use(morgan('dev')); */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'totalSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  store: store
}));

// Middleware to count views
app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // counting the views
  if (pathname == '/dailyNutri/DailyNutri.html' ||  pathname == 'mealTracker/mealTracker.html' || pathname == '/mealCreator/mealCreator.html' || pathname == '/activityTracker/activity.html' || pathname == '/usersFront/editOrDelete.html') {
    req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

    // log the views
    console.log(`UserId: ${req.session.userId}, views on ${pathname}: \u001b[33m${req.session.views[pathname]}\u001b[0m`);
    
    // count the total users logged in
    loggedinUsers = 0;
    for (let index = 0; index < Object.keys(store.sessions).length; index++) {
      if (JSON.parse(store.sessions[Object.keys(store.sessions)[index]]).loggedIn === true) {
        loggedinUsers++;
      }
    }
    console.log('Total users logged in: ', loggedinUsers);
  }

  next();
})

// security settings (apply to all routes)
app.use(function (req, res, next) {
  if (req.session.userId) { // making sure that the user is logged in
    next();
  } else if (req.path === '/usersFront/login.html') { // if not the paths has to be login or signup
    next();
  } else if (req.path === '/usersFront/signup.html') {
    next();
  } else if (req.path === '/usersFront/Logo.png') {
    next();
  } else if (req.path === '/usersFront/Navbar_underside.png') {
    next();
  } else if (req.path === '/usersFront/script.js') {
    next();
  } else if (req.path === '/usersFront/style.css') {
    next();
  } else if (req.path === '/users/login') {
    next();
  } else if (req.path === '/users/signup') {
    next();
  } else if (req.path === '/usersFront/favicon.ico') {
    next();
  } else { // if not the user is redirected to the login page
    res.redirect('/usersFront/login.html');
  }
});

// Connect App routes
app.use('/users', userFunctionality);
app.use('/intakes', intakes);
app.use('/waterregs', waterRegs);
app.use('/ingredients', ingredients)
app.use('/meals', meals);
app.use('/activities', activities);
app.use('/user_activities', user_activities);
app.use('/dailiesForUser', dailiesForUser);


// Serve static files - frontend -> This is the way we host our files on the server. 
const __filename = fileURLToPath(import.meta.url);
import { fileURLToPath } from 'url';
const __dirname = dirname(__filename);
app.use('/activityTracker', express.static(path.join(__dirname, '../activityTracker/frontend')));
app.use('/mealCreator', express.static(path.join(__dirname, '../mealCreator/frontend')));
app.use('/mealTracker', express.static(path.join(__dirname, '../mealTracker/frontend')));
app.use('/dailyNutri', express.static(path.join(__dirname, '../dailyNutri/frontend')));
app.use('/usersFront', express.static(path.join(__dirname, '../userFunctionality/frontend')));

// Start the server
/* console.log("Go to http://localhost:3000/users/login.html to start the application."); -> Bruges først når vi er færdig med frontend */
app.listen(PORT, () => {
  console.log('Server is starting - Config:', config);
  console.log("If your config isnt looking correct, then download the \u001b[31m.env.development\u001b[0m file from this link: \u001b[34mhttps://drive.google.com/file/d/1wlJnTZhnQmqvGLxLa-mVho56qHSTx3OP/view?usp=sharing\u001b[0m and put it in the server folder.");
  console.log(`Server is listing on port ${PORT} -> So go to \u001b[34mhttp://localhost:${PORT}/usersFront/login.html\u001b[0m to start the application. :) 
  `);
})
