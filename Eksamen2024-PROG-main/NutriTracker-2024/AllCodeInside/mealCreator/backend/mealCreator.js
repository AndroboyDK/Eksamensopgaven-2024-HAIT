import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config);

const router = express.Router();
router.use(express.json());

/*
Der laves ikke hele CRUD ops for meals - der laves kun en til at oprette et måltid, 
en til at læse et måltid, en til at opdatere et måltids information (ikke dens ingridiensen) 
og en til at slette et måltid. Derudover laves der en metode til at slette alle måltider for en bruger
I denne fil er der også en metode til at oprette en record i tabellen meal_ingredients - som er en forbindelsestabel
mellem måltider og ingridienser. 
Den er som udgangspunkt uredigerbar for brugeren - kun slet & opret :) 

*/



// POST-metode til at oprette et måltid (BRUGT)
router.post('/', async (req, res) => {
    try {
        req.body.createdByUserId = req.session.userId; // Tilføjer brugerens id til måltidet
        const result = await db.createMeal(req.body);
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

//PUT metode til at opdatere et måltids macros baseret på alle ingridienser 
router.put('/macros/:id', async (req, res) => { 
    try {
        const result = await db.updateMealMacros(req.params.id);
        res.status(200).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* 

// GET-metode til at læse alle en måltid baseret på ideet (IKKE BRUGT)
router.get('/:id', async (req, res) => {
    try {
        const result = await db.readMeal(req.params.id);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});  */
//Get metode til at læse alle måltider for en bruger (BRUGT)
router.get('/user', async (req, res) => {
    try {
        let userId = req.session.userId;

        const result = await db.readAllMealsForUser(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});


//Get metode til at læse alle ingridienser for et måltid (BRUGT)
router.get('/ingrids/:id', async (req, res) => {
    try {
        const result = await db.readAllIngridForMeal(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
})

/* // PUT-metode til at opdatere en måltid  (IKKE BRUGT)
router.put('/:id', async (req, res) => {
    try {
        await db.updateMeal(req.params.id, req.body);
        res.json({ message: 'Meal updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
}); */

// DELETE-metode til at slette en måltid (BRUGT)
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteMealAndIngrids(req.params.id); //SKAL INKLUDERE SLETNING AF INGRIDISENSER
        res.status(200).json({ message: 'Meal deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* //En metode til at slette alle måltider for en bruger - hvis en bruger slettes  (Blev ikke brugt)
router.delete('/user/', async (req, res) => {
    try {
        const userId = req.session.userId;
        await db.deleteAllMealsAndItsIngridientsForUser(userId);
        res.json({ message: 'All meals for user deleted successfully' });
    } catch (error) {
        console.error(error);
        console.log("STUPID")
        res.status(500).json({ error: error?.message });
    }
}); */

//En metode til at oprette en record af måltid - ingridiens forbindelse i tabellen meal_ingredients (BRUGT)
router.post('/mealIngredient', async (req, res) => {
    try {
        const result = await db.createMealIngredients(req.body);
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

//Get metode til at læse antallet af ingridienser for et måltid (BRUGT)
router.get('/ingridcount/:id', async (req, res) => {
    try {
        const result = await db.countIngridsForMeal(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

//Get metode til at læse hvor mange gange et måltid er blevet registreret som indtaget (BRUGT)
router.get('/timesReggedAsIntake/:id', async (req, res) => {
    try {
        const result = await db.countTimesEaten(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});



// Eksporterer routeren, så den kan anvendes af andre filer
export { router as meals };