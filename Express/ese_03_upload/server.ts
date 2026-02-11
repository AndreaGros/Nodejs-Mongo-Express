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


app.get("/api/users", async (req: any, res, next) => {
    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    const collection = client.db(dbName).collection("Users");

    const cmd = collection.find().toArray();

    //restituisce elenco delle collezioni del db (formato JSON)
    const data = await cmd.catch(err => res.status(500).send("Errore di connessione al dbms: " + err));

    res.send(data);

    client.close();
})

app.post("/api/saveBinary", async function (req: any, res, nex) {
    const user = req.body.user
    // i file sono inseriti dentro req.files e non req.bidy anche se è una POST
    const uploadedFile = req.files.blob

    const fileName = await fileManager.saveBinary(uploadedFile.name, uploadedFile.data).catch(err => {
        res.status(500)
        res.send(err)
    })

    if (fileName) {
        const newUser = {
            "username": user,
            "img": fileName
        }
        aggiornaDB(newUser, res)
    }
})

app.post("/api/saveImg64", async function (req: any, res, nex) {
    const user = req.body.user
    let fileName = req.body.fileName
    const imgBase64 = req.body.imgBase64

    fileName = await fileManager.saveBase64(fileName, imgBase64).catch(err => {
        res.status(500)
        res.send(err)
    })

    if (fileName) {
        const newUser = {
            "username": user,
            "img": fileName
        }
        aggiornaDB(newUser, res)
    }
})

async function aggiornaDB(newUser: any, res: any) {
    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    const collection = client.db(dbName).collection("Users");

    const cmd = collection.insertOne(newUser);

    //restituisce elenco delle collezioni del db (formato JSON)
    const data = await cmd.catch(err => res.status(500).send("Errore di connessione al dbms: " + err));

    res.send(data);

    client.close();
}


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