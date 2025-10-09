"use strict"

getNews()

async function getNews() {
    let response = await inviaRichiesta("GET", "/api/elenco")
    if (response.status == 200) {
        wrapper.innerHTML=""
        const news = response.data
        console.log(news)
        for (const notizia of news) {
            let span = document.createElement("span")
            span.classList.add("titolo")
            span.textContent = notizia.titolo
            wrapper.appendChild(span)

            const a = document.createElement("a")
            a.href = "#"
            a.textContent = "Leggi"
            a.addEventListener("click", function(){
                postTexts(notizia.file)
            })
            wrapper.appendChild(a)

            span = document.createElement("span")
            span.classList.add("nVis")
            span.textContent = `[visualizzato ${notizia.visualizzazioni} volte]`
            wrapper.appendChild(span)

            const br = document.createElement("br")
            wrapper.appendChild(br)
        }
    }
    else {
        alert(response.status + ": " + response.err)
    }
}

async function postTexts(fileName) {
    let response = await inviaRichiesta("POST", "/api/dettagli", {fileName})
    if (response.status == 200) {
        const details = response.data.file
        console.log(response.data)
        news.innerHTML = ""
        news.innerHTML = details
        getNews()
    }
    else {
        alert(response.status + ": " + response.err)
    }
}