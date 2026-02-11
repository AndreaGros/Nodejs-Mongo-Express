"use strict"

let idStudente
let username

window.onload = function () {

    let login = $("#login")
    let test = $("#test")
    let lblErrore = $('#lblErrore')

    let _txtUser = document.getElementById("txtUser")
    let _txtPwd = document.getElementById("txtPwd")
    let _btnLogin = document.getElementById("btnLogin")
    let _btnClose = this.document.getElementsByClassName("close")[0]

    let b = document.querySelector("b")

    test.hide()
    lblErrore.hide()

    _btnLogin.addEventListener("click", async () => {
        const HTTPResponse = await inviaRichiesta("POST", "/login", { "user": _txtUser.value, "pwd": _txtPwd.value })
        if (HTTPResponse.status == 200) {
            idStudente = HTTPResponse.data.id
            username = HTTPResponse.data.user
            b.textContent = username
            login.hide()
            test.show()
            scriviDomande()
        }
        else
            if (HTTPResponse.status == 401)
                lblErrore.show()
            else
                alert(HTTPResponse.status + ": " + HTTPResponse.err)
    })

    _btnClose.addEventListener("click", function () {
        lblErrore.hide()
    })
}


async function scriviDomande() {
    let _elencoDomande = document.getElementsByClassName("elencoDomande")[0]
    const questionsResponse = await inviaRichiesta("GET", "/questions")
    if (questionsResponse.status == 200) {
        _elencoDomande.innerHTML = ""
        let domande = questionsResponse.data
        let wrapper = document.createElement("div")
        wrapper.id = "wrapperDomande"
        _elencoDomande.appendChild(wrapper)
        for (const domanda of domande) {

            // idDomande.push(domanda.id)

            let p = document.createElement("p")
            p.textContent = domanda.domanda
            wrapper.appendChild(p)
            let i = 0
            for (const risposta of domanda.risposte) {
                let div = document.createElement("div")
                wrapper.appendChild(div)

                let input = document.createElement("input")
                input.type = "radio"
                input.name = domanda.id
                input.value = i
                i++

                div.appendChild(input)

                let span = document.createElement("span")
                span.textContent = risposta
                div.appendChild(span)
            }
        }
        let btn = document.createElement("button")
        btn.textContent = "invia"
        btn.addEventListener("click", inviaRisposte)
        wrapper.append(btn)
    }
    else
        alert(HTTPResponse.status + ": " + HTTPResponse.err)
}

async function inviaRisposte() {
    let risposte = []
    let risposteInput = document.querySelectorAll("input[type='radio']:checked")
    for (const risposta of risposteInput)
        risposte.push({ "idDomanda": risposta.name, "indiceRisposta": risposta.value })
    let dati = {
        idStudente, risposte
    }
    let HTTPResponse = await inviaRichiesta("POST", "/send", dati)
    if (HTTPResponse.status == 200) {
        alert("Voto: " + HTTPResponse.data)
    }
    else
        alert(HTTPResponse.status + ": " + HTTPResponse.err)

}