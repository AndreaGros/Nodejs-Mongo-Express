"use strict";

const _URL = ""

async function inviaRichiesta(method, url = "", params = {}) {
	method = method.toUpperCase()
	url = "/api" + url;
	let options = {
		"method": method,
		"headers": {},
		"mode": "cors",                  // default
		"cache": "no-cache",             // default
		"credentials": "same-origin",    // default
		"redirect": "follow",            // default
		"referrerPolicy": "no-referrer", // default no-referrer-when-downgrade
	}

	if (method == "GET" || method == "DELETE") {
		options.headers["Content-Type"] = "application/x-www-form-urlencoded"
		const queryParams = new URLSearchParams();
		for (let key in params) {
			let value = params[key];
			// Notare che i parametri di tipo object vengono serializzati
			if (value && typeof value === "object")
				queryParams.append(key, JSON.stringify(value));
			else
				queryParams.append(key, value);
		}
		if (url.includes("?"))
			url += "&"
		else
			url += "?"
		url += queryParams.toString()
	}
	else {
		if (params instanceof FormData) { //FormData => fare upload file binari al server (es. immagini)
			// In caso di formData occorre OMETTERE il Content-Type !
			// options.headers["Content-Type"]="multipart/form-data;" 
			options["body"] = params     // Accept FormData, File, Blob			
		}
		else {
			options["body"] = JSON.stringify(params)
			options.headers["Content-Type"] = "application/json";
		}
	}

	try {
		const response = await fetch(_URL + url, options)
		const text = await response.text()		
		if (!response.ok) {
			return { status: response.status, err: text }
		}
		if (text) {
			// no errore
			try {
				const data = JSON.parse(text)
				return { status: response.status, data }
			}
			catch {
				return { status: 422, err: "Invalid JSON" }
			}
		}
	}
	catch (err) {
		return { status: 408, err: "Connection refused or sever timeout" }
	}
}