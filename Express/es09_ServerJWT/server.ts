//A. import delle librerie
import http from "http";
import https from "https";
import fs from "fs";
import express, { CookieOptions } from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import queryStringParser from "./queryStringParser";
import cors from "cors";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

//B. configurazioni
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();
dotenv.config({ path: ".env" });
const connStr = process.env.connectionStringLocal;

const PORT = parseInt(process.env.PORT!);

const dbName = process.env.dbName;

//C. creazione ed avvio del server HTTP
const server: http.Server = http.createServer(app);
let paginaErr = "";

//server in ascolto sulla porta 1337
// server.listen(PORT, function () {
//     // console.log("Server in ascolto sulla porta " + PORT);

//     fs.readFile("./static/error.html", function (err, content) { //content è una sequenza di byte
//         if (err)
//             paginaErr = "<h1>Risorsa non trovata</h1>";
//         else
//             paginaErr = content.toString();
//     })
// });

const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { "key": privateKey, "cert": certificate };
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT!)
const jwtKey = fs.readFileSync("keys/jwtkey", "utf-8")

let httpServer = https.createServer(credentials, app)

httpServer.listen(HTTPS_PORT, function () {
    console.log("Server in ascolto sulla porta: " + HTTPS_PORT);
})

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

//middleware 5: log dei parametri
app.use((req: any, res, next) => {
    if (req.body && Object.keys(req.body).length > 0)
        console.log("   Parametri body: " + JSON.stringify(req.body));

    if (req["parsedQuery"] && Object.keys(req["parsedQuery"]).length > 0)
        console.log("   Parametri query: " + JSON.stringify(req["parsedQuery"]));

    next();
});

//middleware 6: Vincoli CORS (controlli lato server che consentono di accettare richieste anche da fuori dal dominio -> cioè diverso dal server da cui arrivano le pagine)
const corsOptions = {
    origin: function (origin: any, callback: any) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", cors(corsOptions));

app.use(cookieParser())

const cookiesOptions: CookieOptions = {
    path: "/", //vale per tutte le sotto root
    httpOnly: true,
    secure: true,
    maxAge: parseInt(process.env.DURATA_TOKEN!) * 1000, // durata relatica a partire da ora espressa in ms
    sameSite: "none"
}
// D2. Gestione login e token
app.post("/api/login", async (req: any, res, next) => {
    let username = req.body.username
    let password = req.body.password
    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });
    const db = client.db(dbName)
    const collection = db.collection("mails")
    const cmd = collection.findOne({ username })
    cmd.catch((err) => {
        res.status(500).send("Errore esecuzione query: " + err)
    })
    cmd.then((dbUser) => {
        if (!dbUser)
            res.status(401).send("Username non valido")
        else {
            console.log("Password ricevuta: ", password, "Password DB: ", dbUser.password)
            bcrypt.compare(password, dbUser.password, (err, ok) => {
                if (err) {
                    res.status(500).send("Bcrypt execution error")
                    console.log(err.stack)
                }
                else if (!ok) {
                    res.status(401).send("Password non valida")
                }
                else {
                    const TOKEN = createToken(dbUser)
                    res.cookie("TOKEN", TOKEN, cookiesOptions)
                    res.send({ username })
                }
            })
        }
    })
    cmd.finally(() => {
        client.close()
    })
})

app.post("/api/loginWithGoogle", async (req, res, next) => {
    const googleToken = req.body.googleToken
    let payloadGoogleToken = jwt.decode(googleToken)!
    console.log("Google Token: ", payloadGoogleToken)
    const client = new MongoClient(connStr!)
    await client.connect().catch((err) => {
        res.status(503).send("Errore di connessione al Database")
        return
    })

    const collection = client.db(dbName).collection("mails")
    const cmd = collection.findOne({ username: payloadGoogleToken.email })
    cmd.catch((err) => {
        res.status(500).send("Errore esecuzione query " + err)
        return
    })
    cmd.then((dbUser)=>{
        if(!dbUser){
            let password = ""
            for (let i = 0; i < 12; i++) {
                password += String.fromCharCode
                
            }
        }
    })
})

app.use("/api", (req: any, res, next) => {
    if (!req.cookies || !req.cookies.TOKEN)
        res.status(403).send("Token mancante o scaduto")
    else {
        let token = req.cookies.TOKEN;
        jwt.verify(token, jwtKey, (err: any, payload: any) => {
            if (err) res.status(403).send("Token non valido o scaduto")
            else {
                let newToken = createToken(payload)
                res.cookie("TOKEN", newToken, cookiesOptions)
                req["username"] = payload.username
                next()
            }
        })
    }
})

app.post("/api/logout", async (req, res, next) => {
    const options = {
        ...cookiesOptions, maxAge: -1
    }
    res.cookie("TOKEN", "", options)
    res.send({ ok: 1 })
})

//con filtri
app.get("/api/mails", async (req: any, res, next) => {
    const username = req["username"]
    const currentCollection: string = "mails"

    const client = new MongoClient(connStr!);
    await client.connect().catch(err => {
        res.status(503).send("Errore di connessione al DBMS")
        return;
    });

    const collection = client.db(dbName).collection(currentCollection);

    const cmd = collection.findOne({ username: username }, { projection: { mail: 1 } })

    //restituisce elenco delle collezioni del db (formato JSON)
    const data = await cmd.catch(err => res.status(500).send("Errore di connessione al dbms: " + err));

    res.send(data);

    client.close();
})



//F. default root e gestione errori
app.use(function (req, res) {
    if (!req.originalUrl.startsWith("/api/")) {
        // servizio non trovato
        res.status(404).send(paginaErr);
    }
    else if (req.accepts("html"))
        res.status(404).send(paginaErr);
    else
        res.sendStatus(404)
});

//G. gestione errori
app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});


function createToken(data: any) {
    const now = Math.floor(((new Date()).getTime()) / 1000)
    const payload = {
        _id: data._id,
        username: data.username,
        iat: data.iat || now,
        exp: now + parseInt(process.env.DURATA_TOKEN!)
    }
    const token = jwt.sign(payload, jwtKey)
    console.log("Creato nuovo token: ", token)
    return token
}