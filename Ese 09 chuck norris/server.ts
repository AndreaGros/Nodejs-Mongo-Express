"use strict"

// import
import http, { request, Server } from 'http'
import fs from 'fs'
import express from 'express'
import facts from "./facts.json"
import { url } from 'inspector'
import { generateKey } from 'crypto'
import { json } from 'stream/consumers'

// configurazioni
const icon_url = "https://assets.chucknorris.host/img/avatar/chuck-norris.png";
const api_url = "https://api.chucknorris.io"

const categories = []
//const categories = ["career","money","explicit","history","celebrity","dev","fashion","food","movie","music","political","religion","science","sport","animal","travel"]
const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"]


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

app.get("/api/categories", function (req, res, next) {
    let categories: string[] = []
    let set = new Set(categories)
    let vetsCat = facts["facts"].map(f => f.categories)
    // console.log(vetsCat)
    for (const vet of vetsCat)
        for (const category of vet)
            set.add(category)
    categories = [...set]
    res.send(categories)
})

app.get("/api/facts", function (req, res, next) {
    let category = String(req.query.category)
    res.send(facts["facts"].filter(f => f["categories"].includes(category)))
})

app.post("/api/rate", function (req, res, next) {
    let ids = req.body.ids
    const factsRate = facts["facts"].filter(f => ids.includes(f.id))
    for (const fact of factsRate)
        fact.score++
    fs.writeFileSync("./facts.json", JSON.stringify(facts, null, 3))
    res.send(JSON.stringify("ok"))
})

app.post("/api/add", function (req, res, next) {
    let category = req.body.category
    let value = req.body.value
    let factId: string = generateId()
    let jsonFact = {
        "categories": [
            category
        ],
        "created_at": String(Date.now()),
        "icon_url": icon_url,
        "id": factId,
        "updated_at": String(Date.now()),
        "url": api_url,
        "value": value,
        "score": 0
    }
    facts["facts"].push(jsonFact)
    fs.writeFileSync("./facts.json", JSON.stringify(facts, null, 3))
    res.send(JSON.stringify("ok"))
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



function generateId() {
    let id = ""
    do {
        id = ""
        for (let i = 0; i < 22; i++)
            id += base64Chars[Math.floor(Math.random() * base64Chars.length)];
    } while (facts["facts"].find(f => f.id == id))
    console.log(id)
    return id
}