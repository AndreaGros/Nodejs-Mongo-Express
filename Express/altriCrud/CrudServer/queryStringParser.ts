// NON E' POSSIBILE MODIFICARE REQ["QUERY"] CHE E' IN SOLA LETTURA,
// NON E' POSSIBILE NEANCHE MODIFICARE SINGOLARMENTE IL CONTENUTO DELLE SUE CHIAVI !

function parseQueryString(req: any, res: any, next: any) {
    req["parsedQuery"] = {}
    if(req["query"] && typeof req["query"] == 'object'){
         for (const key in req["query"]) {
            const value = req["query"][key]
            req["parsedQuery"][key] = parseValue(value)
        }
    }
    next()
}

function parseValue(value: any) {
    if (value == "true")
        return true

    if (value == "false")
        return false

    // Number simile a parseInt
    // Restituisce "Not a number" se non è un numero valido
    const num = Number(value) 
    if (!isNaN(num))
        return num

    // typeof NaN restituisce number
    // if (typeof num == "number")
    //     return num

    if (typeof value == "string" && (value.startsWith("{") || value.startsWith("["))) {
        try {
            return JSON.parse(value)
        }
        catch {
            return value
        }
    }
}



export default parseQueryString