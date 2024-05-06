import { Database } from '../../server/database.js';
import { config } from '../../server/config.js';
import express from 'express';

const db = new Database(config);
const router = express.Router();
router.use(express.json());

/*
Det her er igen en CRUD fil... 
Der er en get, post, put og delete metode til vandindtagelser.
Derudover er der også en delete metode, som sletter alle vandindtagelser for en bruger - hvis en bruger skal slettes fra systemet.
*/

//Her er den særlige funktion igen!. 
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


//Her laver jeg en get metode, som henter alle vandindtagelserne for en bruger
router.get('/', async (req, res) => {
    //Her henter jeg userId fra req.params (url'en)
    const userId = req.session.userId;
    
    //så er der en try catch, som prøver at hente vandindtagelserne for en bruger
    try {
        //Her starter try blokken, hvor jeg henter vandindtagelserne for en bruger
        //Jeg bruger db objektet, som er en instans af Database klassen, og kalder readWaterIntake metoden, som henter vandindtagelserne for en bruger
        const waterRegs = await db.readWaterIntakes(userId);
        //Her sender jeg vandindtagelserne for en bruger tilbage til klienten
        res.status(200).json(waterRegs);
        //Her slutter try blokken
    } catch (error) {
        //Her starter catch blokken, som håndterer fejl
        //Her logger jeg fejlen til konsollen
        console.error(error);
        //Her sender jeg en fejlbesked til klienten
        res.status(500).json({ error: error?.message });
    }
});

//Her laver jeg en post metode, som opretter en ny vandindtagelse
router.post('/', async (req, res) => {
    //Her henter jeg data fra req.body
    const data = req.body;
    //Her henter jeg userId fra req.session
    data.userId = req.session.userId;
    try {
        //Så begynder jeg en try blok, som prøver at oprette en ny vandindtagelse
        data.city = await getCityName(data.lon, data.lat, config.azureMapsKey);
        
        //jeg bruger igen db objektet! og kalder createWaterIntake metoden, som opretter en ny vandindtagelse
        const result = await db.createWaterIntake(data);

        //Her sender jeg en besked til klienten om, hvor mange rækker der er blevet påvirket
        res.status(201).json({ affectedRows: result });
    } catch (error) {
        //Her starter catch blokken, som håndterer fejl
        //igen så logger jeg fejlen til konsollen ... Jeg forklarer ikke mere under en catch block. 
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

//Her laver jeg en put metode, som opdaterer en vandindtagelses registrering
router.put('/:id', async (req, res) => {
    //Her henter jeg id fra req.params igen fra url'en
    const id = req.params.id;
    //Jeg henter også data fra req.body - som egentlig skal være de nye data, som skal opdateres. 
    const data = req.body;

    try {
        //Try blok
        //Bruger db metoden updateWaterIntake, som opdaterer en vandindtagelses registrering
        const result = await db.updateWaterIntake(id, data);
        //Sender en besked til klienten om, hvor mange rækker der er blevet påvirket igen.
        res.status(204).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

//Her laver jeg en delete metode, som sletter en vandindtagelses registrering
router.delete('/:id', async (req, res) => {
    //Igen bruger jeg id fra req.params
    const id = req.params.id;
    try {
        //Try blok
        //Bruger db metoden deleteWaterIntake, som sletter en vandindtagelses registrering
        const result = await db.deleteWaterIntake(id);
        res.status(200).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
});

/* //Her laver jeg en delete metode, som sletter alle vandindtagelser for en bruger
router.delete('/user', async (req, res) => {
    //Igen bruger jeg userId fra req.params
    const userId = req.session.userId;
    try {
        //Try blok
        //Bruger db metoden deleteWaterIntakesForAUser, som sletter alle vandindtagelser for en bruger
        const result = await db.deleteWaterIntakesForAUser(userId);
        res.status(200).json({ affectedRows: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error?.message });
    }
}); */

//Her eksportere jeg router objektet, som indeholder mine metoder
export { router as waterRegs };