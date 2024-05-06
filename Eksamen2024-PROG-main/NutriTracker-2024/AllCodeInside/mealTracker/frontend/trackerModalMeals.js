const server = 'http://localhost:3000';

async function loadMeals() {
    let response = await fetch(`${server}/meals/user`);
    let data = await response.json();
    return data;
}

async function renderMealsInSelect() {
    let meals = await loadMeals();
    let select = document.getElementById('recipeSelect');
    meals.forEach(meal => {
        let option = document.createElement('option');
        option.value = meal.mealId;
        option.text = meal.mealName;
        select.appendChild(option);
    });
}

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

postAnIntake = async (data) => {
    let response = await fetch(`${server}/intakes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let responesen = await response.json();
    return responesen;
};

async function getInfoForAndPostAnIntake() {
    let mealId = document.getElementById('recipeSelect').value;
    let dateOfIntake = document.getElementById('dateTime').value;
    let weightInGrams = document.getElementById('recipeWeight').value;

    let data = {
        mealId,
        ingredientId: null,
        dateAndTimeOfIntake: new Date(dateOfIntake + 'Z'),
        weightInGrams
    };
    const response = await postAnIntake(data);
    console.log('Response:', response);
    return response.intakeId;
}

document.addEventListener('DOMContentLoaded', async () => {
    preFillTheDateWithTodaysDateAndCurrentTime();
    await renderMealsInSelect();

    document.getElementById('createAnIntakeMeal').addEventListener('click', async () => {
        try {
            document.getElementById("loadinggif").style.display = "block";
            document.getElementById("external").style.display = "none";
            let intakeId = await getInfoForAndPostAnIntake();
            
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
                document.getElementById("loadinggif").style.display = "none";
                document.getElementById("external").style.display = "flex";
                alert('Meal Intake added successfully');
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
