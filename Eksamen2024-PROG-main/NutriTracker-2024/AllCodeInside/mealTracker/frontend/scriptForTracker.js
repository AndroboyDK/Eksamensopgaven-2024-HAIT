
let server = "http://localhost:3000"

displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

function closeEditForm() {
    document.getElementById("editForm").style.display = "none";
    document.getElementById("external").style.display = "flex";
}


function closeEditFormForMealAndIngrid() {
    document.getElementById("editFormForMealAndIngrid").style.display = "none";
    document.getElementById("external").style.display = "flex";

}

fetchTheEditWaterIntakes = async (id, newWaterAmount, newDateTime) => {
    try {
        // Formatér datoen i det ønskede format
        const isoDateTime = new Date(newDateTime).toISOString();

        let response = await fetch(`${server}/waterRegs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amountOfWater: newWaterAmount,
                dateAndTimeOfDrinking: isoDateTime
            })
        });
        if (!response.ok) {
            throw new Error('Failed to edit water intake');
        }
    } catch (error) {
        console.error(error.message);
    }
}

fetchTheEditMealAndIngrid = async (id, newWeight, newDateTime) => {
    //This is a bit flawed as it relies on the CSS to determine if it is a meal or an ingridient -> We know this is not the best way to do it, but we are running out of time :)
    try {
        // Formatér datoen i det ønskede format
        const isoDateTime = new Date(newDateTime).toISOString();
        let response;
        if (document.getElementById("HOLDSTABLEFORMEALS").style.display === "block") {
            response = await fetch(`${server}/intakes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    weightInGrams: newWeight,
                    dateAndTimeOfIntake: isoDateTime
                })
            });
        } else {
            response = await fetch(`${server}/intakes/ingrid/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    weightInGrams: newWeight,
                    dateAndTimeOfIntake: isoDateTime
                })
            });
        }
        if (!response.ok) {
            {
                throw new Error('Failed to edit meal/ingrid intake');
            }
        }
    } catch (error) {
        console.error(error.message);
    }
};

// Vis redigeringsformularen
showEditForm = (waterRegId, currentWaterAmount, currentDateTime) => {
    // Vis redigeringsformularen
    document.getElementById("editForm").style.display = "block";
    document.getElementById("external").style.display = "none";

    // Fyld inputfelterne med de eksisterende værdier
    document.getElementById("waterRegId").innerText = waterRegId;
    document.getElementById("editWaterAmount").value = currentWaterAmount;
    document.getElementById("editDateTime").value = currentDateTime.substring(0, 16); // her skal der fecthet en dato og tid fra registrering og sættes i input feltet

}

showEditFormForMsAndIngs = (intakeId, currentWeight, currentDateTime) => {
    // Vis redigeringsformularen
    document.getElementById("editFormForMealAndIngrid").style.display = "flex";
    document.getElementById("external").style.display = "none";

    // Fyld inputfelterne med de eksisterende værdier
    document.getElementById("intakeId").innerText = intakeId;
    document.getElementById("editWeight").value = currentWeight;
    document.getElementById("editDateTimeForMealAndIngrid").value = currentDateTime.substring(0, 16);


}


// Funktion til at slette vandindtagelse-registrering
deleteWaterIntake = async (id) => {
    try {
        let response = await fetch(`${server}/waterRegs/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete water intake');
        }
        // Opdater brugergrænsefladen efter sletning
        location.reload();
    } catch (error) {
        console.error(error.message);
    }
}

deleteIntake = async (id) => {
    try {
        let response = await fetch(`${server}/intakes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete intake');
        }
        // Opdater brugergrænsefladen efter sletning
        location.reload();
    } catch (error) {
        console.error(error.message);
    }
};

renderWaterIntakes = async () => {
    try {
        // Foretag en fetch-anmodning til backend for at hente vandindtagelser
        let response = await fetch(`${server}/waterRegs`);
        if (!response.ok) {
            throw new Error('Failed to fetch water intakes');
        }
        let waterIntakes = await response.json();
        // Vis vandindtagelser på siden
        let mealTrackerTableBody = document.getElementById("waterMealTrackerTableBody");

        // Tøm tabellen før du tilføjer nye rækker
        mealTrackerTableBody.innerHTML = '';

        if (waterIntakes.length > 0) {
            waterIntakes.forEach(function (intake) {
                let row = document.createElement("tr");
                row.innerHTML = `
                <td>${new Date(intake.dateAndTimeOfDrinking).toLocaleString('en-EU', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>${intake.amountOfWater} ml</td>
                <td>${intake.city}</td>
                <td>
                <button onclick="showEditForm(${intake.waterRegId}, '${intake.amountOfWater}', '${intake.dateAndTimeOfDrinking}')">Edit</button>
                    <button onclick="deleteWaterIntake(${intake.waterRegId})">Delete</button>
                </td>
            `;
                mealTrackerTableBody.appendChild(row);
            });
        } else {
            let row = document.createElement("tr");
            row.innerHTML = `
            <td colspan="4">No water intakes have been registered</td>
        `;
            mealTrackerTableBody.appendChild(row);
        }
    } catch (error) {
        console.error(error.message);
    }
}
renderMeals = async () => {
    try {
        // Foretag en fetch-anmodning til backend for at hente måltider
        let response = await fetch(`${server}/intakes/meals`);
        if (!response.ok) {
            throw new Error('Failed to fetch water intakes');
        }
        let mealIntakes = await response.json();

        // Vis vandindtagelser på siden
        let mealTrackerTableBody = document.getElementById("mealsMealTrackerTableBody");

        // Tøm tabellen før du tilføjer nye rækker
        mealTrackerTableBody.innerHTML = '';

        if (mealIntakes.length > 0) { // Hvis der er måltider, så vis dem og tilføj knapper til redigering og sletning
            mealIntakes.forEach(function (intake) {
                let row = document.createElement("tr");
                row.innerHTML = `
                <td>${intake.mealName}</td>
                <td>${new Date(intake.dateAndTimeOfIntake).toLocaleString('en-EU', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>${intake.weightInGrams}g - ${Math.round(intake.totalKcal)} kcal</td>
                <td>Protein ${Math.round(intake.totalProtein)}g - Fiber ${Math.round(intake.totalFiber)}g - Fat ${Math.round(intake.totalFat)}g</td>
                <td>${intake.cityName}</td>
                <td>
                <button onclick="showEditFormForMsAndIngs(${intake.intakeId}, '${intake.weightInGrams}', '${intake.dateAndTimeOfIntake}')">Edit</button>
                    <button onclick="deleteIntake(${intake.intakeId})">Delete</button>
                </td>
            `;
                mealTrackerTableBody.appendChild(row);
            });
        } else {
            let row = document.createElement("tr");
            row.innerHTML = `
            <td colspan="6">No meals have been registered</td>
        `;
            mealTrackerTableBody.appendChild(row);
        }
    } catch (error) {
        console.error(error.message);
    }
}
renderIngrids = async () => {
    try {
        // Foretag en fetch-anmodning til backend for at hente vandindtagelser
        let response = await fetch(`${server}/intakes/ingrids`);
        if (!response.ok) {
            throw new Error('Failed to fetch water intakes');
        }
        let ingridIntakes = await response.json();
        // Vis vandindtagelser på siden
        let mealTrackerTableBody = document.getElementById("ingridsMealTrackerTableBody");

        // Tøm tabellen før du tilføjer nye rækker
        mealTrackerTableBody.innerHTML = '';

        if (ingridIntakes.length > 0) {
            ingridIntakes.forEach(function (intake) {
                let row = document.createElement("tr");
                row.innerHTML = `
                <td>${intake.ingredientName}</td>
                <td>${new Date(intake.dateAndTimeOfIntake).toLocaleString('en-EU', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>${intake.weightInGrams}g - ${Math.round(intake.totalKcal)} kcal</td>
                <td>Protein ${Math.round(intake.totalProtein)}g - Fiber ${Math.round(intake.totalFiber)}g - Fat ${Math.round(intake.totalFat)}g</td>
                <td>${intake.cityName}</td>
                <td>
                <button onclick="showEditFormForMsAndIngs(${intake.intakeId}, '${intake.weightInGrams}', '${intake.dateAndTimeOfIntake}')">Edit</button>
                    <button onclick="deleteIntake(${intake.intakeId})">Delete</button>
                </td>
            `;
                mealTrackerTableBody.appendChild(row);
            });
        } else {
            let row = document.createElement("tr");
            row.innerHTML = `<td colspan="6">No ingrids have been registered</td>`
            mealTrackerTableBody.appendChild(row);
        }
    } catch (error) {
        console.error(error.message);
    }

}

document.addEventListener("DOMContentLoaded", function () {
    displayUserNameLoggedIn();
    renderWaterIntakes();
    renderMeals();
    renderIngrids();
    // eventlistener: 
    document.getElementById("showWater").addEventListener("click", function () {
        document.getElementById("HOLDSTABLEFORMEALS").style.display = "none";
        document.getElementById("HOLDSTABLEFORINGRIDS").style.display = "none";
        document.getElementById("tableHolder").style.display = "block";
        document.getElementById("showWater").style.backgroundColor = "var(--color-primary)";
        document.getElementById("showIngrids").style.backgroundColor = "white";
        document.getElementById("showMeals").style.backgroundColor = "white";
    });
    document.getElementById("showMeals").addEventListener("click", function () {
        document.getElementById("tableHolder").style.display = "none";
        document.getElementById("HOLDSTABLEFORINGRIDS").style.display = "none";
        document.getElementById("HOLDSTABLEFORMEALS").style.display = "block";
        document.getElementById("showMeals").style.backgroundColor = "var(--color-primary)";
        document.getElementById("showWater").style.backgroundColor = "white";
        document.getElementById("showIngrids").style.backgroundColor = "white";
    });
    document.getElementById("showIngrids").addEventListener("click", function () {
        document.getElementById("tableHolder").style.display = "none";
        document.getElementById("HOLDSTABLEFORMEALS").style.display = "none";
        document.getElementById("HOLDSTABLEFORINGRIDS").style.display = "block";

        document.getElementById("showIngrids").style.backgroundColor = "var(--color-primary)";
        document.getElementById("showWater").style.backgroundColor = "white";
        document.getElementById("showMeals").style.backgroundColor = "white";

    });

    // Tilføj en eventlytter til redigeringsformularen for at håndtere redigering
    document.getElementById("saveinfo").addEventListener("click", async function () {

        // Hent værdier fra inputfelterne
        let waterRegId = document.getElementById("waterRegId").innerText;
        let newWaterAmount = document.getElementById("editWaterAmount").value;
        let newDateTime = document.getElementById("editDateTime").value;
        newDateTime = new Date(newDateTime).toISOString();

        // Kald funktionen til at redigere vandindtagelsen med de nye værdier
        await fetchTheEditWaterIntakes(waterRegId, newWaterAmount, newDateTime);

        // Skjul redigeringsformularen efter redigering
        document.getElementById("editForm").style.display = "none";
        document.getElementById("external").style.display = "flex";

        // Opdater vandindtagelsesvisningen
        location.reload();
    });

    document.getElementById("saveinfoForMealAndIngrid").addEventListener("click", async function () {

        // Hent værdier fra inputfelterne
        let intakeId = document.getElementById("intakeId").innerText;
        let newWeight = document.getElementById("editWeight").value;
        let newDateTime = document.getElementById("editDateTimeForMealAndIngrid").value;

        // Kald funktionen til at redigere vandindtagelsen med de nye værdier
        await fetchTheEditMealAndIngrid(intakeId, newWeight, newDateTime);


        // Skjul redigeringsformularen efter redigering
        document.getElementById("editFormForMealAndIngrid").style.display = "none";
        document.getElementById("external").style.display = "flex";

        // Opdater ..
        location.reload();
    });


});