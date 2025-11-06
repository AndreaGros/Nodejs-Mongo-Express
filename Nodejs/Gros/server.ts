'use strict'

// importa librerie
import http, { request, Server } from 'http'
import fs from 'fs'
import express from 'express'
import pilots from "./piloti.json"
import circuiti from "./circuiti.json"

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

app.get("/api/circuits", function (req, res, next) {
    res.send(circuiti)
})

app.patch("/api/update", function (req, res, next) {
    let race = req.body.race
    let results= req.body.results
    console.log(typeof(results))
    console.log(race)
    let obj = circuiti.find(f => f.race == req.body.race)
    console.log(obj)
    if(obj)
        obj.saved=true
    res.send("ok")
})

app.get("/api/result", function (req, res, next) {
    let result = Number(req.query.result)
    let scuderia = ""
    let pilota
    for (const obj of pilots) {
        for (const pilot of obj.piloti) {
            if (pilot.numero == result) {
                scuderia = obj.scuderia
                pilota = pilot
                break
            }
        }
    }
    res.send({ "scuderia": scuderia, "pilota": pilota })
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