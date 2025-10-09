'use strict'

//importa librerie
import http from 'http'
import url from 'url'
import fs from 'fs'
import headers from './headers.json'

const port: number = 1337

const server: http.Server = http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse) {
    console.log("richiesta ricevuta: " + req.url)
    const metodo: string = req.method!

    //
    const path = url.parse(req.url!, true)


    // risorsa richiesta al server dal client
    const risorsa: string = path.pathname!
    const params: any = path.query
    const dominio: string = req.headers.host!
    console.log("risorsa: " + risorsa, " params: " + JSON.stringify(params), "dominio: " + dominio)
    if (risorsa == "/favicon.ico") {
        let favicon: NonSharedBuffer = fs.readFileSync("./favicon.ico")
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