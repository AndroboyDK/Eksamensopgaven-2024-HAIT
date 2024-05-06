const server = 'http://localhost:3000';
displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

async function addActivity() {
    const activityId = document.getElementById('activityName').value;
    const dateAndTimeOfActivity = document.getElementById('dateAndTime').value;
    const durationOfActivityInMinutes = document.getElementById('activityDuration').value;

    const dateAndTime = dateAndTimeOfActivity + ':00.000Z'; // Adding seconds and milliseconds to the date
    
    const data = {
        activityId: activityId,
        userId: null,
        dateAndTimeOfActivity: dateAndTime,
        durationOfActivityInMinutes: durationOfActivityInMinutes
    };

    try {
        let result = await fetch('http://localhost:3000/user_activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log('Success:', result.status);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayActivityAddedMessage() {
    alert("The activity has been added!");
}

function clearInputFields() {
    document.getElementById('activityName').value = '';
    document.getElementById('dateAndTime').value = '';
    document.getElementById('activityDuration').value = '';
}

window.onload = function () {
    fetch('http://localhost:3000/activities')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('activityName');
            data.forEach(activity => {
                const option = document.createElement('option');
                option.value = activity.activityId;
                option.text = activity.activityName;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));

    var date = new Date();
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var formattedDate = year + "-" + month + "-" + day + "T" + hours + ":" + minutes;

    document.getElementById('dateAndTime').value = formattedDate;
}

document.addEventListener('DOMContentLoaded', function () {
    displayUserNameLoggedIn();
    document.getElementById('createActivity').addEventListener('click', function () {
        addActivity();
        clearInputFields();
        displayActivityAddedMessage();
    });
});