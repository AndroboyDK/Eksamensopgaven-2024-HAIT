import express from 'express';

import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';


const routes = express.Router();

// database initiation
const database = new Database(config);

// routes
routes.get('/getDailiesDay', async (req, res) => {
    try {
        const userId = req.session.userId;
        const readDailies = await database.readDailyDay(userId);
        res.status(200).json(readDailies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }

});

routes.get('/getDailiesMonth', async (req, res) => {
    try {
        const userId = req.session.userId;
        const readMonthlies = await database.readDailyMonth(userId);
        res.status(200).json(readMonthlies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }   
});


// export
export { routes as dailiesForUser };