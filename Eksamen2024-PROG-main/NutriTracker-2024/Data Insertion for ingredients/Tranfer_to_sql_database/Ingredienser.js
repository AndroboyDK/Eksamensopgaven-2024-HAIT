const helved = require('./arraydd.js');

const axios = require('axios');
const mssql = require('mssql');
let knex = require('knex')({
    client: 'mssql',
    connection: {
        server: 'XXXXXXXXXX.database.windows.net', -> 
        user: 'adminNutriTracker',
        password: 'XXXXXXXXXX',_> // password is hidden
        database: 'NutriTrakerDatabase',
        port: 1433,
        options: {
            encrypt: true
        }
    },
});


/* async function loadTable() {
    return knex.schema.withSchema('eksamen')
    .createTable('ingredients', (table) => {
        table.increments('ingredientId');
        table.string('ingredientName');
        table.float('Kcal100g');
        table.float('protein100g');
        table.float('fiber100g');
        table.float('fat100g');
    });
};
loadTable().then(()=>{
    knex.destroy();
}) */


let arrayOfFoodComp = [];
let arrayOfSortKeys = [1030, 1110, 1240, 1310];

class Ingrediens {
    constructor() {
        let obj = {
            ingredientName: null,
            Kcal100g: null,
            protein100g: null,
            fiber100g: null,
            fat100g: null
        };
    }
    kcalM(value) {
        obj.Kcal100g = value;
    }
    proteinM(value) {
        obj.protein100g = value;
    }
    fiberM(value) {
        obj.fiber100g = value;
    }
    fatM(value) {
        obj.fat100g = value;
    }
}

async function get() {
    for (let index = 1; index < 10 /* 1299 er højst */; index++) {
        let ingrediens = new Ingrediens()
        console.log(`Index: ${index}, foodID: ${helved[index].foodID}`);
        for (let i = 0; i < 4; i++) {

            let response = await axios.get(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${helved[index].foodID}/BySortKey/${arrayOfSortKeys[i]}`, {
                headers: {
                    'accept': 'text/plain',
                    'X-API-Key': '169106'
                }
            });

            if (1030 == arrayOfSortKeys[i]) {
                if (response.data.length == 0 || !response.data[0].hasOwnProperty('resVal') || response.data[0].resVal == null) {
                    ingrediens.Kcal100g = null;
                } else (ingrediens.Kcal100g = parseFloat(response.data[0].resVal.replace(',', '.')))
            } else if (1110 == arrayOfSortKeys[i]) {
                if (response.data.length == 0 || !response.data[0].hasOwnProperty('resVal') || response.data[0].resVal == null) {
                    ingrediens.protein100g = null;
                } else (ingrediens.protein100g = parseFloat(response.data[0].resVal.replace(',', '.')))
            } else if (1240 == arrayOfSortKeys[i]) {
                if (response.data.length == 0 || !response.data[0].hasOwnProperty('resVal') || response.data[0].resVal == null) {
                    ingrediens.fiber100g = null;
                } else (ingrediens.fiber100g = parseFloat(response.data[0].resVal.replace(',', '.')))
            } else if (1310 == arrayOfSortKeys[i]) {
                if (response.data.length == 0 || !response.data[0].hasOwnProperty('resVal') || response.data[0].resVal == null) {
                    ingrediens.fat100g = null;
                } else (ingrediens.fat100g = parseFloat(response.data[0].resVal.replace(',', '.')))
            }

        }

        let response2 = await axios.get(`https://nutrimonapi.azurewebsites.net/api/FoodItems/${helved[index].foodID}`, {
            headers: {
                'accept': 'text/plain',
                'X-API-Key': '169106'
            }
        });

        ingrediens.ingredientName = response2.data.foodName;

        arrayOfFoodComp.push(ingrediens);

    }
    return arrayOfFoodComp;
}



async function getAndInsert() {
    let arrayOfFoodCom = await get()

    console.log(arrayOfFoodCom);

    /* knex('ingredients').insert(arrayOfFoodCom)
        .withSchema('eksamen')
        .then(() => {
            console.log('succeded!')
            knex.destroy();
        }); */

};


getAndInsert()