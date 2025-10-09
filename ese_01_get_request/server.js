'use strict'

//importa librerie
const http = require('http')
const url = require('url')
const fs = require('fs')
const headers = require("./headers.json")

const port = 1337

const server = http.createServer(function (req, res) {
    console.log("richiesta ricevuta: " + req.url)
    const metodo = req.method

    //
    const path = url.parse(req.url, true)


    // risorsa richiesta al server dal client
    const risorsa = path.pathname
    const params = path.query
    const dominio = req.headers.host
    console.log("risorsa: " + risorsa, " params: " + JSON.stringify(params), "dominio: " + dominio)
    if (risorsa == "/favicon.ico") {
        let favicon = fs.readFileSync("./favicon.ico")
        res.writeHead(200, headers.ico)
        res.write(favicon)
    }
    else {
        res.writeHead(200, headers.html)
        res.write("<h1>Informazioni relative alla richiesta ricevuta</h1>")
    }
    res.end()
})

server.listen(port, function () {
    console.log("Server in ascolto sulla porta: " + port)
})