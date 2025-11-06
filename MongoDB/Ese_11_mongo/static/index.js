"use strict"

const headers = ["name", "gender", "hair", "weight", "loves"]
const tbody = document.getElementsByTagName("tbody")[0]
const btns = document.querySelectorAll("button")

btns[0].addEventListener("click", getUnicorns)

async function getUnicorns() {
    let gender = document.querySelector("input[type=radio][name='gender']:checked").value
    const response = await inviaRichiesta("GET", "/api/getUnicorns", { gender })
    if (response.status == 200) {
        tbody.innerHTML = ""
        console.log(response.data)
        const unicorns = response.data

        for (const unicorn of unicorns) {

            let tr = document.createElement("tr")
            tbody.appendChild(tr)

            for (let key in unicorn) {
                let td = document.createElement("td")
                tr.appendChild(td)
                td.textContent = unicorn[key]
            }
        }
    }
    else
        alert(response.status + ": " + response.err)
}

btns[1].addEventListener("click", async function () {
    let unicorn = { "name": txtName.value, "gender": "m", "weight": 100 }
    const response = await inviaRichiesta("POST", "/api/addUnicorn", { unicorn })
    if (response.status == 200) {
        console.log(response.data)
        alert("Record aggiunto correttamente")
        getUnicorns()
    }
    else
        alert(response.status + ": " + response.err)
})

btns[2].addEventListener("click", async function () {
    const name = txtName.value
    const response = await inviaRichiesta("PATCH", "/api/updateUnicorn", { "loves": ["watermelon"], "hair": "brown", name })
    if (response.status == 200) {
        console.log(response.data)
        alert("Record aggiornato correttamente")
        getUnicorns()
    }
    else
        alert(response.status + ": " + response.err)

})

btns[3].addEventListener("click", async function () {
    const name = txtName.value
    const response = await inviaRichiesta("DELETE", "/api/deleteUnicorn", { name })
    if (response.status == 200) {
        console.log(response.data)
        if(response.data.deleteCount > 0){
            alert("Record eliminato correttamente")
            getUnicorns()
        }
        else
            alert("record inesistente")
    }
    else
        alert(response.status + ": " + response.err)

})