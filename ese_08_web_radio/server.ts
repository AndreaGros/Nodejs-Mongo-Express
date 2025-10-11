'use strict'

// importa librerie
import http, { request, Server } from 'http'
import fs from 'fs'
import express from 'express'
import states from "./states.json"
import radios from "./radios.json"

// configurazione server
const port: number = 3000
// funzione di callback richiamata in corrispondenza di ogni richiesta al server
const app: express.Express = express()
const server: Server = http.createServer(app)

let paginaErrore: string = ""
server.listen(port, function () {
    console.log("Server in ascolto sulla porta: " + port)
    fs.readFile("./static/error.html", function (err, content) {
        if (err)
            paginaErrore = "<h1>Risorsa non trovata</h1>"
        else
            paginaErrore = content.toString()
    })
})

// middleware
// 1. request log
app.use("/", function (req, res, next) {
    console.log(req.method + ": " + req.originalUrl)
    next()
})

// 2. gestione risorse statiche
app.use("/", express.static("./static"))

// 3. lettura dei parametri post
// accetto paramtrei post con una dimensione massima di 5MB
app.use("/", express.json({ "limit": "5mb" }))

// 4. log dei parametri post
app.use("/", function (req, res, next) {
    if (req.body && Object.keys(req.body).length > 0)
        console.log("Parametri body: " + JSON.stringify(req.body))
    next()
})

app.get("/api/elenco", function (req, res, next) {
    res.send(states)
})

app.post("/api/radios", function (req, res, next) {
    let region: string = req.body.region
    let regionRadios
    if (region != 'tutti')
        regionRadios = radios.filter(radio => radio.state == region)
    else
        regionRadios = radios
    res.send(regionRadios)
})

app.patch("/api/like", function (req, res, next) {
    let id: string = req.body.id
    const radio = radios.find(r => r.id == id)
    if (radio) {
        let nVotes: number = parseInt(radio.votes)
        nVotes++
        radio.votes = String(nVotes)
        fs.writeFileSync("./radios.json", JSON.stringify(radios, null, 3))
        res.send({radio})
    }
    else
        res.send({"radio":"not found"})
})

app.use("/", function (req, res, next) {
    res.status(404)
    if (!req.originalUrl.startsWith("/api/"))
        res.send(paginaErrore)
    else
        res.send("Risorsa non trovata")
})

app.use("/", function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(500).send(err.message)
    console.log("******** ERRORE *********: \n" + err.stack)
    next()
})