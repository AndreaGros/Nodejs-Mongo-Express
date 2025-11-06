"use strict"

let peopleList;  // vettore enumerativo delle Persone attualmente visualizzate
// comodo per gestire i pulsanti di navigazione
let currentPos;

// i seguenti puntatori sono tutti definiti tramite ID
// let lstCountries 
// let tabStudenti  
// let divDettagli 

btnAdd.addEventListener("click", function () {
    window.location.href = "./inserisci.html"
})

divDettagli.style.display = "none"
getCountries()

async function getCountries() {
    let response = await inviaRichiesta("GET", "/api/getCountries")
    if (response.status == 200) {
        const countries = response.data
        console.log(response.data)
        for (const country of countries) {
            let a = document.createElement("a")
            a.classList.add("dropdown-item")
            a.href = "#"
            a.textContent = country
            a.addEventListener("click", function () {
                getPeopleByCountry(this.textContent)
            })
            lstCountries.appendChild(a)
        }
    }
    else {
        alert(response.status + ": " + response.err)
    }
}

async function getPeopleByCountry(country) {
    let response = await inviaRichiesta("GET", "/api/getPeopleByCountry", { "country": country })
    if (response.status == 200) {
        console.log(response.data)
        tabStudenti.innerHTML = ""
        for (const person of response.data) {
            const tr = document.createElement("tr")
            tabStudenti.appendChild(tr)

            let td = document.createElement("td")
            td.textContent = `${person.name.title} ${person.name.first} ${person.name.last}`
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = person.city
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = person.state
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = person.cell
            tr.appendChild(td)

            td = document.createElement("td")
            let btn = document.createElement("button")
            btn.textContent = "dettagli"
            btn.addEventListener("click", function () {
                getDetails(person.name)
            })
            td.appendChild(btn)
            tr.appendChild(td)

            td = document.createElement("td")
            btn = document.createElement("button")
            btn.textContent = "elimina"
            td.appendChild(btn)
            tr.appendChild(td)
        }
    }
    else
        alert(response.status + ": " + response.err)
}

async function getDetails(name) {
    let response = await inviaRichiesta("GET", "/api/getDetails", name)
    if (response.status == 200) {
        console.log(response.data)
        const person = response.data
        divDettagli.style.display = "block"
        const img = divDettagli.querySelector(".card-img-top")
        if(person.picture)
            img.src = person.picture.large
        else
            img.src = "./img/user.png"
        const title = divDettagli.querySelector(".card-title")
        title.textContent = readNames(person.name)
    }
    else
        alert(response.status + ": " + response.err)
}