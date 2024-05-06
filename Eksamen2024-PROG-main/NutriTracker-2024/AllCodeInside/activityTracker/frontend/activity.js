const server = "http://localhost:3000";

displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

function redirectToActivityModal() {
    window.location.href = `${server}/activityTracker/activityModal.html`;
}

async function fetchActivities() {
    const response = await fetch(`${server}/user_activities`);
    return await response.json();
}

function displayNoActivitiesMessage(table) {
    const row = table.insertRow(-1);
    const noActivitiesCell = row.insertCell(0);
    noActivitiesCell.textContent = "No activities found - go ahead and add some!";
}

function insertActivityIntoTable(activity, table) {
    const row = table.insertRow(-1);

    const activityCell = row.insertCell(0);
    const dateTimeCell = row.insertCell(1);
    const durationCell = row.insertCell(2);
    const kcalCell = row.insertCell(3);
    const editCell = row.insertCell(4);
    const deleteCell = row.insertCell(5);

    activityCell.textContent = activity.activityName;
    dateTimeCell.textContent = new Date(activity.dateAndTimeOfActivity).toLocaleString('en-EU', { timeZone: 'UTC', dateStyle: "medium", timeStyle: "short" });
    durationCell.textContent = activity.durationOfActivityInMinutes;
    kcalCell.textContent = activity.burnedKcal;

    addEditButton(activity, editCell);
    addDeleteButton(activity, deleteCell);
}

function addEditButton(activity, editCell) {
    let editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    editButton.dataId = activity.user_activitiesId;
    editButton.dataName = activity.activityName;
    editButton.addEventListener("click", openEditModal);
    editCell.appendChild(editButton);
}

function openEditModal(e) {
    let id = e.target.dataId;
    let name = e.target.dataName;

    document.getElementById("editModal").style.display = "flex";
    document.getElementById("midBox").style.display = "none";
    document.getElementById("theActivityName").textContent = name;
    document.getElementById("editDateAndTime").value = new Date().toISOString().slice(0, 16);
    document.getElementById("editActivityDuration").value = "";

    document.getElementById("updateActivity").addEventListener("click", async function (e) {
        e.preventDefault();
        let newDateAndTime = document.getElementById("editDateAndTime").value;
        let newDuration = document.getElementById("editActivityDuration").value;

        await updateActivity(id, newDateAndTime, newDuration);

        document.getElementById("editModal").style.display = "none";
        location.reload();
    });
}

async function updateActivity(id, newDateAndTime, newDuration) {
    let response = await fetch(`${server}/user_activities`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_activitiesId: id,
            dateAndTimeOfActivity: new Date(newDateAndTime).toISOString(),
            durationOfActivityInMinutes: newDuration,
        }),
    });

    if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
    }
}

function addDeleteButton(activity, deleteCell) {
    let button = document.createElement("button");
    button.innerHTML = "Delete";
    button.dataId = activity.user_activitiesId;
    button.addEventListener("click", deleteActivity);
    deleteCell.appendChild(button);
}

async function deleteActivity(e) {
    let id = e.target.dataId;

    let response = await fetch(`${server}/user_activities/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        console.log("Activity deleted successfully");
    } else {
        console.error(`Error: ${response.status} - ${response.statusText}`);
    }

    location.reload();
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("midBox").style.display = "block";
}


document.addEventListener("DOMContentLoaded", async function () {
    displayUserNameLoggedIn();
    document.getElementById("createActivity").addEventListener("click", redirectToActivityModal);

    const activities = await fetchActivities();
    console.log(activities);

    const table = document.getElementById("activityTable");

    if (activities.length === 0) {
        displayNoActivitiesMessage(table);
        return;
    }

    activities.forEach((activity) => {
        insertActivityIntoTable(activity, table);
    });

    document.getElementById("closeEditModal").addEventListener("click", closeEditModal);
});
