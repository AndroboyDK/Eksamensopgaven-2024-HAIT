const server = "http://localhost:3000"
let mealIdCreated; // This will be set when the meal is created.
let tempArrayOfIngridientsForAMeal = [];

displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

mealCreationFetch = async (data) => {
    let response = await fetch(`${server}/meals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let returnsMealId = await response.json();
    console.log('Måltiden er lavet', returnsMealId.affectedRows);
    return returnsMealId.affectedRows;
}
fetchIngridients = async (string) => {
    let response = await fetch(`${server}/ingredients/ingridSearch/${encodeURIComponent(string)}`);
    let data = await response.json();
    return data;
}
postFetchMealIngridients = async (data) => {
    let response = await fetch(`${server}/meals/mealIngredient`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let responesen = await response.json();
    console.log('Ingredienserne er smidt ind i meal_ingredients', responesen);
    return responesen;
}
putFetchMealForMacros = async (mealIdCreated) => {
    console.log('putFetchMealForMacros - id nr denne får', mealIdCreated);
    let response = await fetch(`${server}/meals/macros/${parseInt(mealIdCreated)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    let affectedRows = await response.json();
    console.log('Opdateret måltidens macros ifølge fetch', affectedRows);
    return affectedRows;
}

function addIngridInfoToTempArray(ingridId, ingridName) {

    let tempIngridient = {
        ingridName: ingridName,
        ingridientId: ingridId,
        amount: document.getElementById('weightOfItem').value
    }
    //A user cannont add the same ingredient twice therfore we check if the ingredient is already in the array
    let found = tempArrayOfIngridientsForAMeal.find(ingrid => ingrid.ingridientId === tempIngridient.ingridientId);
    if (found) {
        alert('You have already added this ingredient to the meal. Please choose another one.');
        return;
    }
    tempArrayOfIngridientsForAMeal.push(tempIngridient);
    document.getElementById('weightOfItem').value = '';
    document.getElementById('itemsInput').value = '';
    document.getElementById('top5Ingrids').innerHTML = '';
    document.getElementById('holdfooditemspushedin').innerHTML = '';
    tempArrayOfIngridientsForAMeal.forEach(ingrid => {
        let p = document.createElement('p');
        p.textContent = `${ingrid.ingridName} - ${ingrid.amount}g`;
        document.getElementById('holdfooditemspushedin').appendChild(p);
    });
    console.log('Funktionen som tilføjer ingridienser til et array er kørt');
}

// postFetchUdregningForEnMåltid = async (mealId) => {
// }
runThruTempArrayAndPostIngridients = async () => {
    tempArrayOfIngridientsForAMeal.forEach(async (ingrid) => {
        let ingridient = {
            mealId: mealIdCreated,
            ingredientId: ingrid.ingridientId,
            gramsOfIngredient: ingrid.amount
        }
        await postFetchMealIngridients(ingridient);
    });
    console.log('Funktionen som poster ingridienser til et måltid er kørt')
    console.log('Arrayet med ingridienser ser sådan ud inden den bliver ryddet', tempArrayOfIngridientsForAMeal);
    tempArrayOfIngridientsForAMeal = [];
}


async function mealFetchAndHideOtherMidbox() {
    //vis gif
    document.getElementById("loadinggif").style.display = "block";
    document.getElementById("holdseverythingafternav").style.display = "none";
    let mealName = document.getElementById('mealname').value;

    let meal = {
        mealName: mealName,
        createdOn: new Date().toISOString(),
        kcal100g: null,
        protein100g: null,
        fiber100g: null,
        fat100g: null,
    }

    mealIdCreated = await mealCreationFetch(meal);
    console.log('Måltidet er lavet', mealIdCreated);
    //skjul gif
    document.getElementById("loadinggif").style.display = "none";
    document.getElementById("holdseverythingafternav").style.display = "flex";

    let OtherMidBox = document.getElementById('OtherMidBox');
    let midBox = document.getElementById('midBox');
    OtherMidBox.style.display = 'none';
    midBox.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    displayUserNameLoggedIn();
    document.getElementById('postMeal').addEventListener('click', () => {
        mealFetchAndHideOtherMidbox();
        console.log('Klikket på knappen for at oprette et måltid');
    });
    document.getElementById("mealname").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            mealFetchAndHideOtherMidbox();
            console.log('Enter er trykket for at oprette et måltid');
        }
    });

    let input = document.getElementById('itemsInput');
    input.addEventListener('input', async function (e) {
        let value = e.target.value;
        // Fetch your API with the value
        try {
            let data = await fetchIngridients(value);
            let select = document.getElementById('top5Ingrids');
            select.innerHTML = '';
            data.ingredientAttributes.forEach(ingredient => {
                let option = document.createElement('option');
                option.value = ingredient.ingredientId;
                option.text = ingredient.ingredientName;
                select.appendChild(option);
            });

        } catch (error) {
            console.error(error);
        }
    });


    document.getElementById('addIngridBtn').addEventListener('click', () => {
        let select = document.getElementById('top5Ingrids');
        let ingredientId = select.value;
        let ingredientName = select.options[select.selectedIndex].text;
        addIngridInfoToTempArray(ingredientId, ingredientName);
        console.log('Klikket på knappen for at tilføje ingridienser til et måltid og smidt dem i arrayet')
    });

    document.getElementById("goBackToCreator").addEventListener('click', () => {
        if (tempArrayOfIngridientsForAMeal.length === 0) {
            alert('You must add at least one ingredient to the meal');
            return;
        } else {window.location.href = "../mealCreator/MealCreator.html";}
    }); 

    document.getElementById('createMeal').addEventListener('click', async () => {
        if (tempArrayOfIngridientsForAMeal.length === 0) {
            alert('You must add at least one ingredient to the meal');
            return;
        }
        document.getElementById("holdseverythingafternav").style.display = "none";
        document.getElementById("loadinggif").style.display = "block";
        await runThruTempArrayAndPostIngridients();
        setTimeout(async () => {
            await putFetchMealForMacros(mealIdCreated);
            window.location.href = "mealCreator.html";
        }, 3000);
    });

});