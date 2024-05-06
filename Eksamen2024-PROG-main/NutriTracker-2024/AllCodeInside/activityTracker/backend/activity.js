import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config); // laver en ny database med config. config er fra config.js

const router = express.Router(); // tager express og laver en router
router.use(express.json()); // bruger json

// Read all activities til at hente alle aktiviteter -> bruges i frontend til at vise en drop down menu med alle aktiviteter. 
router.get('/', async (req, res) => {
    try {
        const activities = await db.readActivities();
        res.status(200).json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* //En get metode til kun at hente en aktivitet - bliver ikke brugt i frontend
router.get('/:id', async (req, res) => {
    try {
        const activity = await db.readActivity(req.params.id);
        res.status(200).json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
}); */

export { router as activities };