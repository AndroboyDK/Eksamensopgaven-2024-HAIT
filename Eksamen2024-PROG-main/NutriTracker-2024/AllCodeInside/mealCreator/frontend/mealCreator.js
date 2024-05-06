const server = "http://localhost:3000"

displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

fetchMealsForUser = async () => {
    let response = await fetch(`${server}/meals/user/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await response.json();
    return data;
}
deleteAMeal = async (id) => {
    let response = await fetch(`${server}/meals/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let responsi = await response.json();
    return responsi;
}
fetchNumbOfIngridsForMeal = async (mealId) => {
    let response = await fetch(`${server}/meals/ingridcount/${mealId}`);
    let data = await response.json();
    return data;
}

fetchTimesReggedAsIntake = async (mealId) => {
    let response = await fetch(`${server}/meals/timesReggedAsIntake/${mealId}`);
    let data = await response.json();
    return data;
}
fetchIngridsForMeal = async (mealId) => {
    let response = await fetch(`${server}/meals/ingrids/${mealId}`);
    let data = await response.json();
    return data;
}
fetchingAndRenderIngridsForMeal = async (mealId) => {
    let response = await fetch(`${server}/meals/ingrids/${mealId}`);
    let data = await response.json();
    let ingredientList = document.getElementById('ingredientList');
    ingredientList.innerHTML = ''; // Clean the inner HTML of the ingredient list
    for (let ingredient of data) {
        let li = document.createElement('li');
        li.innerHTML = `${ingredient.ingredientName} - ${ingredient.gramsOfIngredient}g`;
        ingredientList.appendChild(li);
    }
};


//Main render function
render = async () => {
    let table = document.getElementById('mealTable');
    let meals = await fetchMealsForUser();
    table.innerHTML = ''; // Clean the inner HTML of the table
    if (meals.length > 0) {
        // Create table headers
        const headers = ['Meal #', 'Meal Name', 'Relevant macros pr. 100g', 'Added on', '# ingredients', 'Times Eaten', 'View', 'Delete'];
        const trHeader = document.createElement('tr');
        for (let header of headers) {
            const th = document.createElement('th');
            th.innerHTML = header;
            trHeader.appendChild(th);
        }
        table.appendChild(trHeader);
        // Create table rows
        for (let i = 0; i < meals.length; i++) {
            const numberOfIngrids = await fetchNumbOfIngridsForMeal(meals[i].mealId)
            const timesReggedAsIntake = await fetchTimesReggedAsIntake(meals[i].mealId);
            tr = document.createElement('tr');
            mealDestructured = {
                mealNumberInView: i + 1,
                mealName: meals[i].mealName,
                totalKcal: ` ${Math.round(meals[i].kcal100g)} kcal || ${Math.round(meals[i].protein100g)}g protein || ${Math.round(meals[i].fat100g)}g fat || ${Math.round(meals[i].fiber100g)}g fiber`,
                dateAdded: meals[i].createdOn.slice(0, 10),
                numberOfIngrid: numberOfIngrids.numberOfIngrids,
                timesReggedAsIntake: timesReggedAsIntake.timesEaten
            }
            tr.dataId = meals[i].mealId;
            for (let key in mealDestructured) {
                let td = document.createElement('td');
                td.innerHTML = mealDestructured[key];
                tr.appendChild(td);
            }
            let viewTd = document.createElement('td');
            let viewButton = document.createElement('button');
            viewButton.innerHTML = 'View';
            viewButton.addEventListener('click', function (e) {
                let id = e.target.parentElement.parentElement.dataId;
                document.getElementById('viewIngridsModal').style.display = 'block';
                document.getElementById('closeViewIngridsModal').addEventListener('click', function () {
                    document.getElementById('viewIngridsModal').style.display = 'none';
                });
                fetchingAndRenderIngridsForMeal(id);

            });
            viewTd.appendChild(viewButton);
            tr.appendChild(viewTd);
            table.appendChild(tr);
            let td = document.createElement('td');
            let button = document.createElement('button');
            button.innerHTML = 'Delete';
            button.addEventListener('click', async function (e) {
                let id = e.target.parentElement.parentElement.dataId;
                let responsi = await deleteAMeal(id);
                if (responsi.error) {
                    alert("The meal could not be deleted. Please make sure that you dont have any intakes registered with the meal and then try again.");
                }
                render();
            });
            td.appendChild(button);
            tr.appendChild(td);
            table.appendChild(tr);
        }
    } else {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        tr.innerHTML = 'You have no meals yet. Create one by clicking the "+" button in the top right corner.';
        tr.appendChild(td);
        table.appendChild(tr);
    }
}

//Eventlistener for the load event
window.addEventListener('load', async function () { // jeg går ud fra at det her er forkert Sebastian -> Men fiks det lige med hvordan man så skal få fat i userId... 
    render();
    displayUserNameLoggedIn();
});