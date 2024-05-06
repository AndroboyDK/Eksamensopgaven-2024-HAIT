import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config); // create a new database with config. config is from config.js

const router = express.Router(); // create a router using express
router.use(express.json()); // use json

// POST method to create an activity
router.post('/', async (req, res) => {
    try {
        req.body.userId = req.session.userId; // add userId to body from session :)
        const result = await db.createActivity(req.body);
        req.body.userId = null; // remove userId from body again
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// GET method to read all activities based on a user id
router.get('/', async (req, res) => {
    try {
        // The userId is taken from the session and not from the request anymore, therefore the request is not needed anymore
        const userId = req.session.userId;
        const result = await db.readUserActivities(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// PUT method to update an activity
router.put('/', async (req, res) => { // should be removed or commented out?
    try {
        await db.updateUserActivities(req.body);
        res.status(200).json({ message: 'Activity updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// DELETE method to delete an activity
router.delete('/:id', async (req, res) => {
    try {
        const message = await db.deleteUseractivity(req.params.id);
        res.status(204).json({ message: `Activity deleted successfully with message: ${message}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* // Delete all activities for a user.
Not used
router.delete('/user/:id', async (req, res) => {
    try {
        // The userId is taken from the session and not from the request anymore, therefore the req.params.id is not needed anymore
        const userId = req.session.userId;
        const message = await db.deleteAllUserActivities(userId);
        res.json({ message: `All activities deleted successfully with message:${message}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
}); */

export { router as user_activities };
