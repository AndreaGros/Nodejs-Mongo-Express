'use strict'

//importa librerie
const http = require('http')
const url = require('url')
const fs = require('fs')
const mime = require('mime-types')
const headers = require("./headers.json")

const port = 1337
let paginaErrore

const server = http.createServer(function (req, res) {
    console.log("richiesta ricevuta: " + req.url)
    const metodo = req.method

    const path = url.parse(req.url, true)


    // risorsa richiesta al server dal client
    let risorsa = path.pathname
    const params = path.query
    const dominio = req.headers.host
    // console.log("risorsa: " + risorsa, " params: " + JSON.stringify(params), "dominio: " + dominio)
    if (risorsa == "/")
        risorsa = "/index.html"

    if (!risorsa.startsWith("/api/")) {
        risorsa = "./static/" + risorsa
        fs.readFile(risorsa, function (err, content) {
            if (!err) {
                let header = { "content-type": mime.lookup('risorsa') }
                res.writeHead(200, header)
                res.write(content)
            }
            else {
                res.writeHead(404, headers.html)
                res.write(paginaErrore)
            }
            res.end()
        })
    }
    else if (risorsa == "/api/risorsa1") {
        res.writeHead(200, headers.json)
        res.write(JSON.stringify({ "benvenuto": params.nome }))
        res.end()
    }
    else if(risorsa == "/api/risorsa2"){
        res.writeHead(200, headers.json)
        res.write(JSON.stringify({ "benvenuto": "pluto" }))
        res.end()
    }
    else{
        res.writeHead(404, headers.text)
        res.write("Risorsa non trovata o non disponibile")
        res.end()
    }
})

server.listen(port, function () {
    console.log("Server in ascolto sulla porta: " + port)
    fs.readFile("./static/error.html", function (err, content) {
        if (err)
            paginaErrore = "<h1>Risorsa non trovata</h1>"
        else
            paginaErrore = content.toString()
    })
})