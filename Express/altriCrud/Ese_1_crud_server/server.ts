"use strict"

//a. importare le librerie
import http from "http";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import {MongoClient, ObjectId} from "mongodb";

//b. callback
const app: express.Express = express();
// prende le configurazioni dal file .env
dotenv.config({path: './.env'});
const connectionString = process.env.connectionStringAtlas;
const dbName = process.env.dbName;
const PORT = parseInt(process.env.PORT!);

//c. configurazione e avvio del server http
const server = http.createServer(app);
let paginaErrore:string = "";
server.listen(PORT, function(){
    console.log(`Server in ascolto sulla porta ${PORT}`);
    fs.readFile("./static/error.html", function(err, content){
        if(err){
            paginaErrore = "<h1>Risorsa non trovata</h1>";
        }
        else{
            paginaErrore = content.toString();
        }
    });
});

//d. middleware
// 1. log della richiesta
// in app.use() se ometto la risorsa, vuol dire che richiama '/'
app.use('/',function(req, res, next){
    console.log(`${req.method} : ${req.originalUrl}`);
    next();
});

// 2. gestione delle risorse statiche
app.use('/', express.static('./static'));

// 3. lettura dei parametri post
// i parametri post sono restuituiti in req.body già parsificati
// i parametri get sono sempre in req.query già parsificati
app.use('/',express.json({'limit': '5mb'}));

// 4. log dei parametri post, non get perchè sono già visibili nel 1o middleware
app.use('/', function(req, res, next){
    if(req.body && Object.keys(req.body).length > 0){
        console.log("    parametri body: " + JSON.stringify(req.body));
    }
    next();
});

//e. gestione delle root dinamiche
app.get('/api/getCollections', async function(req, res, next){
    const client = new MongoClient(connectionString!);
    await client.connect().catch(err=>{
        res.status(503).send("Errore di connessione al database");
        return;
    });
    const db = client.db(dbName);
    // restituisce l'elenco delle collezioni presenti nel db
    const cmd = db.listCollections().toArray();
    cmd.then(function(data){
        res.send(data);
    });
    cmd.catch(function(err){
        res.status(500).send("Errore lettura collezioni" + err);
    });
    cmd.finally(function(){
        client.close();
    });
});

// nome della collezione passato come risorsa
app.get('/api/:collection', async function(req, res, next){
    const selectedName = req.params.collection;
    // filtri passati con get
    const filters = req.query;
    const client = new MongoClient(connectionString!);
    await client.connect().catch(err=>{
        res.status(503).send("Errore di connessione al database");
        return;
    });
    const collection = client.db(dbName).collection(selectedName);
    let cmd = collection.find(filters).toArray();
    cmd.then(function(data){
        res.send(data);
    });
    cmd.catch(function(err){
        res.status(500).send("Errore lettura collezioni" + err);
    });
    cmd.finally(function(){
        client.close();
    });
});

app.get('/api/:collection/:id', async function(req, res, next){
    const selectedName = req.params.collection;
    const selectedId = req.params.id;
    const client = new MongoClient(connectionString!);
    await client.connect().catch(err=>{
        res.status(503).send("Errore di connessione al database");
        return;
    });
    const collection = client.db(dbName).collection(selectedName);
    let cmd = collection.findOne({_id: new ObjectId(selectedId)});
    cmd.then(function(data){
        res.send(data);
    });
    cmd.catch(function(err){
        res.status(500).send("Errore lettura collezioni" + err);
    });
    cmd.finally(function(){
        client.close();
    });
});

app.post('/api/:collection', async function(req, res, next){
    const selectedName = req.params.collection;
    const newRecord = req.body;
    const client = new MongoClient(connectionString!);
    await client.connect().catch(err=>{
        res.status(503).send("Errore di connessione al database");
        return;
    });
    const collection = client.db(dbName).collection(selectedName);
    let cmd = collection.insertOne(newRecord);
    cmd.then(function(data){
        res.send(data);
    });
    cmd.catch(function(err){
        res.status(500).send("Errore lettura collezioni" + err);
    });
    cmd.finally(function(){
        client.close();
    });
});

app.delete('/api/:collection/:id', async function(req, res, next){
    const selectedName = req.params.collection;
    const selectedId = req.params.id;
    const client = new MongoClient(connectionString!);
    await client.connect().catch(err=>{
        res.status(503).send("Errore di connessione al database");
        return;
    });
    const collection = client.db(dbName).collection(selectedName);
    let cmd = collection.deleteOne({_id: new ObjectId(selectedId)});
    cmd.then(function(data){
        res.send(data);
    }
    );
    cmd.catch(function(err){
        res.status(500).send("Errore lettura collezioni" + err);
    });
    cmd.finally(function(){
        client.close();
    });
});

//f. default root
app.use(function(req, res, next){
    res.status(404);
    if(!req.originalUrl.startsWith('/api/')){
        res.send(paginaErrore);
    }
    else{
        res.send("Risorsa non trovata");
    }
});

//g. gestione degli errori
app.use('/',function(err:Error,req:express.Request, res:express.Response, next: express.NextFunction){
    // err.stack contiene l'elenco completo degli errori
    res.status(500).send(err.message);
    console.log('****** ERRORE ******\n' + err.stack);
});