import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config);

const router = express.Router();
router.use(express.json());

/*
Denne route fil er meget særlig fordi jeg også definerer en funktion heri. 
Denne funktion har til formål at fetche azure map search api'en og returnere en "city". 
Der er self tale om en async funktion, som tager de to parametre "lon" og "lat" og den retunerer en string som er "cityName".

I denne fil er der ellers hele CRUD palleten for intakes, og kun read, create og delete for locations.
Read metoden retunerer alle intakes og locations for en bruger - ikke alle intakes og locations i databasen - selfølgelig.
Der er også en delete metode, som sletter alle intakes og locations for en bruger.


*/

//Her er den særlige funktion. 
async function getCityName(lon, lat, azureMapsKey) {
    //Funktionen tager tre parametre, lon, lat og azureMapsKey.
    try {
        //Jeg fetcher azure maps api'en og jeg bruger de tre parametre til at lave en "reverse geocoding" request.
        const response = await fetch(`https://atlas.microsoft.com/search/address/reverse/json?subscription-key=${azureMapsKey}&api-version=1.0&query=${lat},${lon}&language=da`);
        //Jeg konverterer responsen til json
        const data = await response.json();
        //Hvis der er en "address" i data og den har en "municipality" så returnerer jeg denne som "city". 
        if (data && data.addresses && data.addresses[0]) {
            const city = data.addresses[0].address.municipality;
            return city;
        } else {
            //Hvis der ikke er en "address" i data eller den ikke har en "municipality" så returnerer jeg en fejlbesked og smider en error string i databsen.
            console.error("Unexpected response structure from Azure Maps API");
            return "Error - Unexpected response from Azure Maps API";
        }
    } catch (error) {
        //Hvis der så er en fejl i fetchen, så returnerer jeg en fejlbesked og smider en error string i databsen også. 
        console.error(error);
        return "Error - Azure Maps API was not working during the request";
    }

    //Man kan godt sige at jeg laver dobbelt fejlhåndtering - men det er for at være sikker på at der altid er en string i databasen, som kan bruges til at vise en by.
}
//Husk at tjekke om jeres environment variabler er sat korrekt - der skal være en variabel som hedder AZURE_MAPS_KEY - se teams. 



// Read all intakes and location
router.get('/meals', async (req, res) => {
    const userId = req.session.userId;
    try {
        const intakes = await db.readAllMealsAsIntakes(userId);
        
        res.status(200).json(intakes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

router.get('/ingrids', async (req, res) => {
    const userId = req.session.userId;
    try {
        const intakes = await db.readAllIngridsAsIntakes(userId);
        
        res.status(200).json(intakes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});


// Create intake
router.post('/', async (req, res) => {
    const data = req.body;
    try {
        data.userId = req.session.userId; 
        const result = await db.createIntake(data);
        res.status(201).json({ intakeId: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// Create intake with ingredient
router.post('/ingrid', async (req, res) => {
    const data = req.body;
    try {
        data.userId = req.session.userId;
        const result = await db.createIntakeWithIngredient(data);
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// Create intake location
router.post('/location', async (req, res) => {
    //Særligt i denne route, så kalder jeg en funktion, som jeg har defineret i toppen af denne fil.
    let data = req.body;
    //Jeg kalder funktionen getCityName, som egentlig på baggrund af lon og lat, returnerer en string som er "cityName".
    data.cityName = await getCityName(data.lon, data.lat, config.azureMapsKey);
    try {
        //Nu bruger jeg db objektet og vi kalder createIntakeLocation metoden, som opretter en ny intake location
        const result = await db.createIntakeLocation(data);
        //Her sender jeg en besked til klienten om, hvor mange rækker der er blevet påvirket (affectedRows) - dette vil ikke blive vist på frontend dog. 
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// Update intake
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await db.updateIntake(id, data);
        res.status(204).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

router.put('/ingrid/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const result = await db.updateIngridIntake(id, data);
        res.status(204).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

// Delete intake and location
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.deleteIntakeAndIntakeLocation(id);
        res.status(200).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* //Delete all intakes and location regs for a user (Not used afterall)
router.delete('/user', async (req, res) => {
    const userId = req.session.userId;
    try {
        const result = await db.deleteAllIntakesAndIntakeLocations(userId);
        res.status(200).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
}); */

export { router as intakes };