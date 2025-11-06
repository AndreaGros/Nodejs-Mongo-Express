'use strict'

// importa librerie
import http, { request, Server } from 'http'
import fs from 'fs'
import express from 'express'
import people from "./people.json"

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

app.get("/api/getCountries", function (req, res, next) {

    // const countries: string[] = []
    // for (const person of people.results) {
    //     if (!countries.includes(person.location.country))
    //         countries.push(person.location.country)
    // }
    // countries.sort()

    // res.send(countries)

    let countries: string[] = []
    // set non accetta duplicato ma non è un vettore, quindi va convertito
    let set = new Set(countries)
    for (const person of people.results)
        set.add(person.location.country)
    countries = [...set]
    countries.sort()
    res.send(countries)
})

app.get("/api/getPeopleByCountry", function (req, res, next) {
    if (!req.query)
        res.status(400).send("parametri mancanti")
    else {
        const peopleByCountry: any = people.results.filter(p => p.location.country === req.query.country).map(p => ({
            name: p.name,
            city: p.location.city,
            state: p.location.state,
            cell: p.cell
        }))
        res.send(peopleByCountry)
    }
})

app.get("/api/getDetails", function (req, res, next) {
    const name = req.query
    if (!name)
        res.status(400).send("Paramatro mancante")
    else {
        const person = people.results.find(p => JSON.stringify(p.name) == JSON.stringify(name))
        res.send(person) 
    }
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