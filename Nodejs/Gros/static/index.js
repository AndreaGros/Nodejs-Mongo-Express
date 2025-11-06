let sez2 = document.getElementsByClassName("row")[1]
sez2.style.display = "none"
let sez3 = document.getElementsByClassName("row")[2]
sez3.style.display = "none"

let btnResults = document.getElementsByTagName("button")[0]

getCircuits()



async function getCircuits() {
    let response = await inviaRichiesta("GET", "/api/circuits")
    if (response.status = 200) {
        let tbody = document.getElementsByTagName("tbody")[0]
        let i = 1
        for (const circuit of response.data) {
            const tr = document.createElement("tr")
            tbody.appendChild(tr)

            tr.addEventListener("click", function () {
                if (circuit.results) {
                    getResults(circuit.results)
                    let titleResults = document.getElementsByTagName("h1")[1]
                    titleResults.textContent = `Risultati del Gran Premio di ${circuit.location}`
                    sez2.style.display = "flex"
                    sez3.style.display = "flex"
                    btnResults.addEventListener("click", function () {
                        updateResults(circuit.race, circuit.results, circuit.saved)
                    })
                }
                else
                    alert("I risultati non sono disponibili")
            })

            const th = document.createElement("th")
            th.scope = "row"
            th.textContent = i++
            tr.appendChild(th)

            let td = document.createElement("td")
            const img = document.createElement("img")
            img.src = `https://flagcdn.com/48x36/${circuit.countryCode.toLowerCase()}.png`
            img.title = circuit.country
            img.style.maxHeight = "30px"
            td.appendChild(img)
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = circuit.race
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = circuit.circuit
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = circuit.location
            tr.appendChild(td)
        }
    }
    else
        alert(response.status + ": " + response.err)
}

async function getResults(results) {
    let pos = 1
    let sez2Body = document.getElementsByTagName("tbody")[1]
    sez2Body.innerHTML = ""
    for (const result of results) {
        // console.log(typeof(result))
        let response = await inviaRichiesta("GET", "/api/result", { result })
        if (response.status = 200) {
            let pilot = response.data.pilota
            let scuderia = response.data.scuderia

            let tr = document.createElement("tr")
            sez2Body.appendChild(tr)

            let td = document.createElement("td")
            td.textContent = pos++
            td.setAttribute("rowspan", "3")
            tr.appendChild(td)

            td = document.createElement("td")
            td.setAttribute("rowspan", "3")
            tr.appendChild(td)


            let img = document.createElement("img")
            img.src = `./img/${pilot.nome.replace(" ", "-")}.jpg`
            td.appendChild(img)

            td = document.createElement("td")
            td.textContent = pilot.numero
            tr.appendChild(td)

            tr = document.createElement("tr")
            sez2Body.appendChild(tr)

            td = document.createElement("td")
            td.textContent = pilot.nome
            tr.appendChild(td)

            tr = document.createElement("tr")
            sez2Body.appendChild(tr)

            td = document.createElement("td")
            td.textContent = scuderia
            tr.appendChild(td)

        }
        else {
            alert(response.status + ": " + response.err)
        }
    }
}

async function updateResults(race, results, saved) {
    console.log(race, results)
    if (!saved) {
        let response = await inviaRichiesta("PATCH", "/api/update", { race, results })
        if (response.status == 200) {
            alert("Aggiornato")
        }
        else {
            alert(response.status + ": " + response.err)
        }
    }
    else
        alert("Già aggiornato")
}