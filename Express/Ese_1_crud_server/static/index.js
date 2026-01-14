"use strict"

// inizializzazione puntatori
const divIntestazione = document.getElementById("divIntestazione")
const divFilters = document.querySelector(".card")
const lstHair = document.getElementById("lstHair")
const divCollections =  document.getElementById("divCollections")
const table = document.getElementById("mainTable")
const thead = table.querySelector("thead")
const tbody = table.querySelector("tbody")
const divDettagli = document.getElementById("divDettagli")


// avvio
let currentCollection = "";
divFilters.style.display = "none"

getCollections();


async function getCollections() {
	const HTTPResponse = await inviaRichiesta("GET", "/api/getCollections")
	if (HTTPResponse.status == 200) {
		console.log(HTTPResponse.data);
		const collections = HTTPResponse.data;
		const label = divCollections.querySelector("label");
		for (const collection of collections) {
			// con true clona anche quelli all'interno
			const clonedLabel = label.cloneNode(true)
			clonedLabel.querySelector("span").textContent = collection.name

			clonedLabel.querySelector("input[type='radio']").addEventListener("click", function () {
				currentCollection = collection.name
				btnAdd.disabled = false
				btnUpdate.disabled = false
				getData(collection)
			})
			divCollections.appendChild(clonedLabel)
		}
		label.remove()
	}
	else
		alert(HTTPResponse.status + " : " + HTTPResponse.err)
}

async function getData() {
	const HttpResponse = await inviaRichiesta("GET", `/api/${currentCollection}`);
	if (HttpResponse.status == 200) {
		console.log(HttpResponse.data);
		const strongs = divIntestazione.querySelectorAll("strong");
		strongs[0].textContent = currentCollection;
		strongs[1].textContent = HttpResponse.data.length;
		tbody.innerHTML = "";
		for (let item of HttpResponse.data) {
			const tr = document.createElement("tr");
			tbody.append(tr);

			let td = document.createElement("td");
			td.addEventListener("click", function () { getCurrent(item._id) });
			td.textContent = item._id;
			tr.append(td);

			td = document.createElement("td");
			const secondKey = Object.keys(item)[1];
			// item.secondKey equivale a item["secondKey"]
			td.textContent = item[secondKey];
			tr.append(td);

			thead.querySelector("th:nth-of-type(2)").textContent = secondKey;

			td = document.createElement("td");
			let div = document.createElement("div");
			td.append(div);
			div = document.createElement("div");
			td.append(div);
			div = document.createElement("div");
			td.append(div);
			tr.append(td);
		}
		if (currentCollection == "unicorns") {
			divFilters.style.display = ""
		}
		else {
			divFilters.style.display = "none"
		}
	}
	else {
		alert(HttpResponse.status + HttpResponse.err);
	}
}

async function getCurrent(id) {
	const HttpResponse = await inviaRichiesta("GET", `/api/${currentCollection} / ${id}`);
	if (HttpResponse.status == 200) {
		console.log(HttpResponse.data);
		let currentItem = HttpResponse.data;
		divDettagli.innerHTML = "";
		for (let key in currentItem) {
			const strong = document.createElement("strong");
			strong.textContent = key + ": ";
			divDettagli.appendChild(strong);

			const span = document.createElement("span");
			span.textContent = JSON.stringify(currentItem[key]);
			divDettagli.appendChild(span);

			const br = document.createElement("br");
			divDettagli.appendChild(br);
		}
	}
	else {
		alert(HttpResponse.status + HttpResponse.err);
	}
}

btnFind.addEventListener("click", function () {
	const hair = lstHair.value
	let gender = ""
	const genderChecked = divFilters.querySelector("input[type=checkbox]:checked")
	if (genderChecked)
		gender = genderChecked.value
	let filters = {}
	if (hair)
		filters.hair = hair.toLowerCase()
	if (gender)
		filters.gender = gender.toLowerCase()
})

btnAdd.addEventListener("click", function(){
    divDettagli.innerHTML = "";
    const textArea = document.createElement("textarea");
    divDettagli.appendChild(textArea);
    textArea.style.height = 100 + "px";
    textArea.value = '{\n "name": "pippo",\n "example": "modify this"\n}';
    addTextAreaBtn("POST");
});

function addTextAreaBtn(method){
    let btn = document.createElement("button");
    btn.textContent = "Invia";
    btn.classList.add("btn", "btn-success", "btn-sm");
    btn.style.margin = "10px";
    divDettagli.appendChild(btn);

    btn.addEventListener("click", async function(){
        let newRecord = divDettagli.querySelector("textarea").value;
        try{
            newRecord = JSON.parse(newRecord);
        }
        catch(err){
            alert("JSON non valido\n" + err);
            return;
        }

        let resource = `/${currentCollection}`;
        const HttpResponse = await inviaRichiesta(method, resource, newRecord);
        if(HttpResponse.status == 200){
            console.log(HttpResponse.data);
            alert("Operazione eseguita con successo");
            divDettagli.innerHTML = "";
            getData();
        }
        else{
            alert(HttpResponse.status + " " + HttpResponse.err);
        }
    });

    btn = document.createElement("button");
    divDettagli.appendChild(btn);

    btn.textContent = "Chiudi";
    btn.classList.add("btn", "btn-secondary", "btn-sm");
    btn.style.margin = "10px";
    btn.addEventListener("click", function(){
        divDettagli.innerHTML = "";
    });
}

async function deleteCurrent(id){
    if(confirm("Vuoi veramente cancellare il record" +  id + "?")){
        let resource = `/${currentCollection}/${id}`;
        let HttpResponse = await inviaRichiesta("DELETE", resource);
        if(HttpResponse.status == 200){
            console.log(HttpResponse.data);
            alert("Cancellazione avvenuta con successo");
            getData();
        }
        else{
            alert(HttpResponse.status + " " + HttpResponse.err);
        }   
    }
}