let server = "http://localhost:3000";

waterCreationFetch = async (data) => {
    let response = await fetch(`${server}/waterRegs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let returnsARes = await response.json();
    return returnsARes.affectedRows;
}

// Funktion til at navigere tilbage til Meal Tracker-siden
function goBack() { // der er en anden funktion der hedder history.back() som gør det samme
    window.location.href = "mealTracker.html"; // Erstat med din faktiske side
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


// Funktion til at registrere vandforbruget og sende data til databasen
async function registerWater() {
    // Hent værdier fra inputfelter
    document.getElementById("loadinggif").style.display = "block";
    document.getElementById("holder1").style.display = "none";
    let waterAmount = document.getElementById("waterAmount").value;

    const date = document.getElementById("dateTime").value;
    try {
        const location = await getGeoLocationFromBrowser();
        // Opret et objekt med data til at sende til databasen
        let waterData = {
            /* userId: userId, */
            amountOfWater: waterAmount,
            dateAndTimeOfDrinking: new Date(date + 'Z'),
            lon: location.longitude,
            lat: location.latitude
        };

        let response = await waterCreationFetch(waterData); // Send data til databasen
        console.log(response);
        if (response === 1) {
            document.getElementById("loadinggif").style.display = "none";
            document.getElementById("holder1").style.display = "block";
            alert("Water intake added successfully");
            window.location.href = "mealTracker.html";
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding intake, please check that you allowed us to see your location. If you did not allow us to see your location, please reload the page and allow it');
        history.back();
    }


}

document.addEventListener('DOMContentLoaded', function () {
    preFillTheDateWithTodaysDateAndCurrentTime();
    document.getElementById("doThis").addEventListener("click", registerWater);
});