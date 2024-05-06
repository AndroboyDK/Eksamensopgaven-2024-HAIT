const server = "http://localhost:3000"

displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

fetchIngridients = async (string) => {
    let response = await fetch(`${server}/ingredients/ingridSearch/${encodeURIComponent(string)}`);
    let data = await response.json();
    return data;
}

document.addEventListener('DOMContentLoaded', () => {
    displayUserNameLoggedIn();
    let ul = document.getElementById('loadInfoInhere');
    ul.innerHTML = '';
    let li = document.createElement('li');
    li.textContent = `Type something to search for ingredients - the food items will be loaded in this format: ⬇️`;
    ul.appendChild(li);
    let li2 = document.createElement('li');
    li2.textContent = `Name of the ingredient --------- Kcal pr 100 grams - Protein pr 100 grams - Fiber pr 100 grams - Fat pr 100 grams`;
    ul.appendChild(li2);

    let input = document.getElementById('inputFromUser');
    input.addEventListener('input', async function (e) {
        let value = e.target.value;
        // Fetch your API with the value
        try {
            let data = await fetchIngridients(value);
            ul.innerHTML = '';
            data.ingredientAttributes.forEach(item => {
                let li = document.createElement('li');
                li.textContent = ` ${item.ingredientName} -------- ${Math.round(item.Kcal100g)} Kcal pr 100 grams - ${Math.round(item.protein100g)} Protein pr 100 grams- ${Math.round(item.fiber100g)} Fiber pr 100 grams - ${Math.round(item.fat100g)} Fat pr 100 grams`;
                ul.appendChild(li);
            });
        } catch (error) {
            console.error(error);
        }
    });

}); 