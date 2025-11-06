'use strict'

btnInvia1.addEventListener("click", async function () {
    let response = await inviaRichiesta("GET", "/api/risorsa1", { "nome": "pippo" })
    if (response.status == 200)
        alert(JSON.stringify(response.data))
    else
        alert(response.status + ": " + response.err)
})


btnInvia2.addEventListener("click", async function () {
    let response = await inviaRichiesta("POST", "/api/risorsa2", { "nome": "pippo" })
    if (response.status == 200)
        alert(JSON.stringify(response.data))
    else
        alert(response.status + ": " + response.err)
})

