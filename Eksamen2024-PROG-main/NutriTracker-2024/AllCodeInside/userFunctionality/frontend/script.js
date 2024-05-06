const server = "http://localhost:3000";
function confirmDelete() {
    return confirm("Are you sure you want to delete your user?");
}
displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

document.addEventListener("DOMContentLoaded", function () {
    displayUserNameLoggedIn();
});