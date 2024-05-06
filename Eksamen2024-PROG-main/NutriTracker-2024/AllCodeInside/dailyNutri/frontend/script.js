const server = 'http://localhost:3000';
displayUserNameLoggedIn = async () => {
    const response = await fetch(`${server}/users/getusername`);
    const user = await response.json();
    document.getElementById("loggedInUser").textContent = `User logged in: ${user.name}`;
}

window.addEventListener('click', async function(e) {
    // ----------------------//
    // ---- TURN TO DAY ---- //
    // ----------------------//
    if (e.target.id === 'turnToDay') {
        // remove the default value
        document.getElementById('defualt_value').style.display = 'none';
        // change the color of the buttons
        e.target.style.backgroundColor = 'var(--color-secondary-blue)';
        document.getElementById('turnToMonth').style.backgroundColor = 'var(--color-secondary-blueLight)';

        // change the display of the table
        let table = document.getElementById('table');
        table.innerHTML = '';

        // get data from the server
        const response = await fetch('http://localhost:3000/dailiesForUser/getDailiesDay/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',}})
        const data = await response.json();

        // create the table
        const tr = document.createElement('tr');
        const arrayOfHeader = ['Time in day', 'Intake energy (kcal)', 'Intake water (ml)', 'Burned (kcal)', 'Energy balance (kcal)'];
        for (let i = 0; i < arrayOfHeader.length; i++) {
            th = document.createElement('th');
            th.innerHTML = arrayOfHeader[i];
            tr.appendChild(th);
        }
        table.appendChild(tr);

        // create an array of hours
        let hourIndex = new Date().getHours();
        const arrayOfHours = [];
        for (let index = data.length; index > 0; index--) {
            arrayOfHours.push(hourIndex);
            if (hourIndex === 0) {
                hourIndex = 24;
            }
            hourIndex = hourIndex - 1;
            
        }

        // insert data into the table
        for (let index = 0; index < data.length; index++) {
            // creating elements
            const tr = document.createElement('tr');
            const tdHour = document.createElement('td');
            const tdTotalBurned = document.createElement('td');
            const tdTotalEnergy = document.createElement('td');
            const tdTotalWater = document.createElement('td');
            const tdEnergyBalance = document.createElement('td');

            // appending values to the hour elements
            if (arrayOfHours[index] < 10) { 
                if (arrayOfHours[index] < 9) {
                    tdHour.innerHTML = '0' + arrayOfHours[index] + ':00 - 0' + (arrayOfHours[index] + 1) + ':00';
                } else {
                    tdHour.innerHTML = '0' + arrayOfHours[index] + ':00 - ' + (arrayOfHours[index] + 1) + ':00';
                }
            } else {
                tdHour.innerHTML = arrayOfHours[index] + ':00 - ' + (arrayOfHours[index] + 1) + ':00';
            }

            tdTotalBurned.innerHTML = Math.round(data[arrayOfHours[index]].TotalBurned * 100) / 100;
            tdTotalEnergy.innerHTML = Math.round(data[arrayOfHours[index]].TotalEnergy * 100) / 100;
            tdTotalWater.innerHTML = Math.round(data[arrayOfHours[index]].TotalWater * 100) / 100;

            // calculating the energy balance
            let energyBalance = Math.round((data[arrayOfHours[index]].TotalEnergy - data[arrayOfHours[index]].TotalBurned) * 100) / 100;
            tdEnergyBalance.innerHTML = energyBalance;
            
            // appending the elements to the row and then the table
            tr.appendChild(tdHour);
            tr.appendChild(tdTotalEnergy);
            tr.appendChild(tdTotalWater);
            tr.appendChild(tdTotalBurned);
            tr.appendChild(tdEnergyBalance);
            table.appendChild(tr);
        }
    
    }

    // ----------------------//
    // --- TURN TO MONTH --- //
    // ----------------------//
    if (e.target.id === 'turnToMonth') {
        // remove the default value
        document.getElementById('defualt_value').style.display = 'none';
        // change the color of the buttons
        e.target.style.backgroundColor = 'var(--color-secondary-blue)';
        document.getElementById('turnToDay').style.backgroundColor = 'var(--color-secondary-blueLight)';

        // change the display of the table
        let table = document.getElementById('table');
        table.innerHTML = '';

        // get data from the server
        const response = await fetch('http://localhost:3000/dailiesForUser/getDailiesMonth/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',}}) 
        const data = await response.json();

        // create the table
        tr = document.createElement('tr');
        const arrayOfHeader = ['Date', 'Intake energy', 'Intake water', 'Kcals burned', 'Energy balance'];
        for (let i = 0; i < arrayOfHeader.length; i++) {
            th = document.createElement('th');
            th.innerHTML = arrayOfHeader[i];
            tr.appendChild(th);
        }
        table.appendChild(tr);

        // insert data into the table
        if (data.length > 0) {
            for (let i = data.length -1; i > -1; i--) {
                // creating elements
                tr = document.createElement('tr');
                const tdDate = document.createElement('td');
                const tdTotalEnergy = document.createElement('td');
                const tdTotalWater = document.createElement('td');
                const tdTotalBurned = document.createElement('td');
                const tdEnergyBalance = document.createElement('td');

                // appending values to the elements
                tdDate.innerHTML = new Date(data[i].Day).toDateString();
                tdTotalEnergy.innerHTML = Math.round(data[i].TotalEnergy * 100) / 100;
                tdTotalWater.innerHTML = Math.round(data[i].TotalWater * 100) / 100;
                tdTotalBurned.innerHTML = Math.round(data[i].TotalBurned * 100) / 100;

                // calculating the energy balance
                let energyBalance = Math.round((data[i].TotalEnergy - data[i].TotalBurned) * 100) / 100;
                tdEnergyBalance.innerHTML = energyBalance;

                // appending the elements to the row and then the table
                tr.appendChild(tdDate);
                tr.appendChild(tdTotalEnergy);
                tr.appendChild(tdTotalWater);
                tr.appendChild(tdTotalBurned);
                tr.appendChild(tdEnergyBalance);

                table.appendChild(tr);
            }
            
        }
    }

});

document.addEventListener('DOMContentLoaded', async function() {
    displayUserNameLoggedIn();
});