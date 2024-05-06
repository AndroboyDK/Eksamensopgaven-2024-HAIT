import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config);

const router = express.Router();
router.use(express.json());

/*
I denne fil laves der to read metoder til ingridienser.
Den ene er en GET-metode, som søger på en ingrediens baseret på et søgenavn og retunerer de top 5 resultater.
Den anden er en get metode, som søger på en ingrediens baseret på et id og retunerer de attributter, som er tilknyttet ingrediensen.

*/


// Her opretter jeg en POSR-metode, som læser attributterne for en ingrediens baseret på et søgenavn
router.get('/ingridSearch/:name', async (req, res) => {

    const name = decodeURIComponent(req.params.name); // Decode the URL parameter

    // Try to read the attributes of the ingredient from the database
    try {
        const result = await db.searchIngridient(name);
        res.json({ ingredientAttributes: result });

    // If an error occurs, send an error message to the client
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

router.get('/ingridient/:id', async (req, res) => { //Not used in frontend
    const id = req.params.id;
    try {
        const result = await db.readIngredientById(id);
        res.json({ ingredientAttributes: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});


// Eksporterer routeren, så den kan anvendes af andre filer
export { router as ingredients };