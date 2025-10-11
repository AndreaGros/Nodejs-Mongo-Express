"use strict"

getRegions()

async function  getRegions() {
    let response = await inviaRichiesta("GET", "/api/elenco")
    if(response.status == 200){
        let regions = response.data
        console.log(regions)
        for(const region of regions){
            let option = document.createElement("option")
            option.textContent = `${region.name} [${region.stationcount} emittenti]`
            option.value = region.value
            lstRegioni.appendChild(option)
        }
        lstRegioni.addEventListener("change", function(){
            getRadios(lstRegioni.value)
        })
        getRadios(lstRegioni.value)
    }
    else
        alert(response.status + ": " + response.err)
}

async function getRadios(region){
    let response = await inviaRichiesta("POST", "/api/radios", {region})
    if(response.status == 200){
        let regionRadios = response.data
        console.log(regionRadios)
        tbody.innerHTML = ""
        for(const radio of regionRadios){
            const tr = document.createElement("tr")
            tbody.appendChild(tr)

            let td = document.createElement("td")
            tr.appendChild(td)

            let img = document.createElement("img")
            img.src = radio.favicon
            img.style.width = "40px"
            td.appendChild(img)

            td = document.createElement("td")
            td.textContent = radio.name
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = radio.codec
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = radio.bitrate
            tr.appendChild(td)

            td = document.createElement("td")
            td.textContent = radio.votes
            tr.appendChild(td)

            td = document.createElement("td")
            tr.appendChild(td)

            img = document.createElement("img")
            img.src = "./like.jpg"
            img.style.width = "40px"
            img.addEventListener("click", function(){
                patchLike(radio.id)
            })
            td.appendChild(img)



        }
    }
    else
        alert(response.status + ": " + response.err)
}

async function patchLike(id) {
    let response = await inviaRichiesta("PATCH", "/api/like", {id})
    console.log(response.data)
    if(response.status == 200){
        alert("Voti aggiornati")
        getRadios(lstRegioni.value)
    }
    else
        alert(response.status + ": " + response.err)
}