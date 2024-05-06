const server = "http://localhost:3000"

function preFillTheDateWithTodaysDateAndCurrentTime() {
    let dateTimeInput = document.getElementById('dateTime');
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hours = String(currentDate.getHours()).padStart(2, '0');
    let minutes = String(currentDate.getMinutes()).padStart(2, '0');
    let formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    dateTimeInput.value = formattedDate;
}

fetchIngridients = async (string) => {
    let response = await fetch(`${server}/ingredients/ingridSearch/${encodeURIComponent(string)}`);
    let data = await response.json();
    return data;
}

postFetchAnIngridAsAnIntake = async (data) => {
    let response = await fetch(`${server}/intakes/ingrid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let responesen = await response.json();
    return responesen;
};

getGeoLocationFromBrowser = async () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
};

async function getInfoForAndPostIntake() {
    let select = document.getElementById('top5Ingrids');
    let ingredientId = select.value;
    let dateOfIntake = document.getElementById('dateTime').value;
    let weightInGrams = document.getElementById('recipeWeight').value;

    let data = {
        /* userId, //Det her skal kommenteres ud når vi kører en rigtig login :)  */
        mealId: null,
        ingredientId: ingredientId,
        dateAndTimeOfIntake: new Date(dateOfIntake + 'Z'),
        weightInGrams
    };
    const response = await postFetchAnIngridAsAnIntake(data);
    return response.affectedRows;
}

postIntakeLocation = async (data) => {
    let response = await fetch(`${server}/intakes/location`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let responesen = await response.json();
    return responesen;
}

document.addEventListener('DOMContentLoaded', () => {

    preFillTheDateWithTodaysDateAndCurrentTime();


    let input = document.getElementById('itemsInput');
    input.addEventListener('input', async function (e) {
        let value = e.target.value;
        // Fetch your API with the value
        let select = document.getElementById('top5Ingrids');
        try {
            let data = await fetchIngridients(value);
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

    document.getElementById('createAnIntakeIngrid').addEventListener('click', async () => {
        try {
            document.getElementById("loadinggif").style.display = "block";
            document.getElementById("external").style.display = "none";
            let intakeId = await getInfoForAndPostIntake();
            const location = await getGeoLocationFromBrowser();
            if (!location.longitude) {
                alert('Could not get location');
                throw new Error('Could not get location');
            }
            const lat = location.latitude;
            const lon = location.longitude;
            const data = {
                intakeId,
                lon,
                lat
            }
            const response = await postIntakeLocation(data);
            if (response.affectedRows === 1) {
                console.log('Success:', data);
                document.getElementById("loadinggif").style.display = "none";
                document.getElementById("external").style.display = "flex";
                alert('Ingredient intake added successfully');
                window.location.href = "mealTracker.html";
            }
        }
        catch (error) {
            console.error('Error:', error);
            alert('Error adding intake, please check that you allowed us to see your location. If you did not allow us to see your location, please reload the page and allow it');
            history.back();
        }
    });
});