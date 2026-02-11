//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryStringParser";
import cors from "cors";
import fileupload from "express-fileupload"
import fileManager from "./fileManager";

//B. configurazioni
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();
dotenv.config({ path: ".env" });
const connStr = process.env.connectionStringLocal;
const port = parseInt(process.env.PORT!);
const dbName = process.env.dbName;

//C. creazione ed avvio del server HTTP
const server: http.Server = http.createServer(app);
let paginaErr = "";

//server in ascolto sulla porta 1337
server.listen(port, function () {
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function (err, content) { //content è una sequenza di byte
        if (err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});

//D. middleware
//middleware 1: request log
app.use(function (req, res, next) //se si omette => come risorsa "/"
{
    console.log("Ricevuta richiesta: " + req.method + ": " + req.originalUrl);
    next(); //passa al middleware successivo
});

//middleware 2: gestione delle risorse statiche
app.use(express.static("./static"));

//middleware 3: gestione dei parametri post
app.use(express.json({ "limit": "5mb" })); //i parametri post sono restituiti in req.body
//i parametri get invece sono restituiti come json in req.query

//middleware 4: parsing dei parametri GET
app.use("/", queryStringParser);

//middleware 5: return del formData
app.use(fileupload({
    "limits": { "fileSize": (20 * 1024 * 1024) } // 20 MB
}));

//middleware 6: log dei parametri
app.use((req: any, res, next) => {
    if (req.body && Object.keys(req.body).length > 0)
        console.log("   Parametri body: " + JSON.stringify(req.body));

    if (req["parsedQuery"] && Object.keys(req["parsedQuery"]).length > 0)
        console.log("   Parametri query: " + JSON.stringify(req["parsedQuery"]));

    next();
});

//middleware 7: Vincoli CORS (controlli lato server che consentono di accettare richieste anche da fuori dal dominio -> cioè diverso dal server da cui arrivano le pagine)
const corsOptions = {
    origin: function (origin: any, callback: any) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));

app.post("/api/login", async (req, res, next) => {
    const user = req.body.user
    const pwd = req.body.pwd
    const client = new MongoClient(connStr!)
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    let collection = client.db(dbName).collection("studenti");

    let cmd = collection.findOne({ user, pwd })

    let userFounded = await cmd.catch(err =>
        res.status(500).send("Errore di connessione al dbms: " + err))

    if (!userFounded) {
        res.status(401)
        res.send("Credenziali non valide")
    }
    else {
        res.status(200)
        res.send(userFounded)
    }
    client.close()
})

app.get("/api/questions", async (req: any, res: any, next) => {
    const client = new MongoClient(connStr!)
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    let collection = client.db(dbName).collection("domande")

    let cmd = collection.find().project({ id: 1, domanda: 1, risposte: 1, _id: 0 }).toArray()

    let data = await cmd.catch(err =>
        res.status(500).send("Errore di connessione al dbms: " + err))

    res.status(200)
    res.send(data)
    client.close()
})

app.post("/api/send", async (req: any, res: any, next) => {
    let idStudente = req.body.idStudente
    let risposte = req.body.risposte

    const client = new MongoClient(connStr!)
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });
    let collection = client.db(dbName).collection("domande")
    let cmd = collection.find().toArray()

    let data: any[] = await cmd.catch(err =>
        res.status(500).send("Errore di connessione al dbms: " + err))

    let voto = 0

    for (const risposta of risposte) {
        let rispostaEsatta = data.find(item => { return item.id == risposta.idDomanda })
        if (rispostaEsatta.correct == risposta.indiceRisposta)
            voto += 1
        else
            voto -= 0.25
    }

    let collectionStudenti = client.db(dbName).collection("studenti")

    let cmdStudente = collectionStudenti.updateOne({ "id": idStudente }, { $set: { "voto": voto } })

    let studente = await cmdStudente.catch(err =>
        res.status(500).send("Errore di connessione al dbms: " + err))
    console.log({ "id": idStudente })

    res.send(voto)
    client.close()
})

//F. default root e gestione errori
app.use(function (req, res) {
    res.status(404);

    if (!req.originalUrl.startsWith("/api/"))
        res.send(paginaErr);
    else
        res.send("Risorsa non trovata");
});

//G. gestione errori
app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});