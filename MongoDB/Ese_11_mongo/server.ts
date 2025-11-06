'use strict'

// importa librerie
import http, { request, Server } from 'http'
import fs from 'fs'
import express from 'express'
import { MongoClient } from 'mongodb'

// configurazione server
const port: number = 3000
// funzione di callback richiamata in corrispondenza di ogni richiesta al server
const app: express.Express = express()
const connectionString = "mongodb://localhost:27017"
const dbName = "unicorns"
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

app.get("/api/getUnicorns", async function (req, res, next) {
    const gender = req.query.gender
    const client = new MongoClient(connectionString)
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al server")
        res.status(503).send("Errore di connessione al DBMS")
        return
    });
    let collection = client.db(dbName).collection("unicorns")
    let cmd = collection.find({ gender }).project({ name: 1, loves: 1, hair: 1, weight: 1, _id: 0 }).sort({ name: 1 }).toArray()
    cmd.catch(function (err) {
        res.status(500).send("Errore nell'esecuzione della query")
    })
    cmd.then(function (data) {
        res.send(data)
    })
    cmd.finally(function () {
        client.close()
    })

})

app.post("/api/addUnicorn", async function (req, res, next) {
    const unicorn = req.body.unicorn
    const client = new MongoClient(connectionString)
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al server")
        res.status(503).send("Errore di connessione al DBMS")
        return
    });
    let collection = client.db(dbName).collection("unicorns")
    let cmd = collection.insertOne(unicorn)
    cmd.catch(function (err) {
        res.status(500).send("Errore nell'esecuzione della query")
    })
    cmd.then(function (data) {
        res.send(data)
    })
    cmd.finally(function () {
        client.close()
    })
})

app.patch("/api/updateUnicorn", async function (req, res, next) {
    const name = req.body.name
    const hair = req.body.hair
    const loves = req.body.loves
    const client = new MongoClient(connectionString)
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al server")
        res.status(503).send("Errore di connessione al DBMS")
        return
    });
    let collection = client.db(dbName).collection("unicorns")
    console.log(name, hair, loves)
    let cmd = collection.updateOne({ name }, { $set: { loves, hair } })
    cmd.catch(function (err) {
        res.status(500).send("Errore nell'esecuzione della query")
    })
    cmd.then(function (data) {
        res.send(data)
    })
    cmd.finally(function () {
        client.close()
    })
})

app.delete("/api/deleteUnicorn", async function (req, res, next) {
    const name = req.body.name

    const client = new MongoClient(connectionString)
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al server")
        res.status(503).send("Errore di connessione al DBMS")
        return
    });
    let collection = client.db(dbName).collection("unicorns")
    let cmd = collection.deleteOne({ name })
    cmd.catch(function (err) {
        res.status(500).send("Errore nell'esecuzione della query" +err.message)
    })
    cmd.then(function (data) {
        res.send(data)
    })
    cmd.finally(function () {
        client.close()
    })
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