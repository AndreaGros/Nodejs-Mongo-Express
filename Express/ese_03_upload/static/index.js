'use strict'

// aumentare il timeout a 10 sec perchè cloudinary ci mette molto a rispondere !

const tbody = mainTable.querySelector("tbody")
const buttons = document.querySelectorAll("button.btn-success")

getUsers()

async function getUsers() {
	const HTTPResponse = await inviaRichiesta("GET", "/users")
	if (HTTPResponse.status == 200) {
		console.log(HTTPResponse.data)
		let users = HTTPResponse.data
		tbody.innerHTML = ""
		for (const user of users) {
			let tr = document.createElement("tr")
			tr.classList.add("text-center")
			tbody.append(tr)

			let td = document.createElement("td")
			td.textContent = user.username
			tr.append(td)

			user.img = "./img/" + user.img

			td = document.createElement("td")
			tr.append(td)

			let img = document.createElement("img")
			img.src = user.img
			img.addEventListener("error", function () {
				img.src = "./img/user.png"
			})
			td.append(img)
		}
	}
	else
		alert(HTTPResponse.status + " : " + HTTPResponse.err)
}

txtFile.addEventListener("change", async function () {
	const blob = txtFile.files[0]
	if (blob) {
		const base64Img = await base64Convert(blob).catch(function (err) {
			alert(err)
		})
		imgPreview.src = base64Img
	}
})

for (const button of buttons) {
	button.addEventListener("click", async function () {
		let user = txtUser.value
		let blob = txtFile.files[0]
		if (!user || !blob) {
			alert("Inserire username e immagine")
			return
		}
		let formData = new FormData()
		let HTTPResponse
		let imgBase64
		switch (button.id) {
			case "btnBinary":
				formData.append("user", user)
				formData.append("blob", blob)
				console.log(formData)
				HTTPResponse = await inviaRichiesta("POST", "/saveBinary", formData)
				break
			case "btnBase64":
				imgBase64 = await base64Convert(blob)
				const params = {
					"username": user,
					"fileName": blob.name,
					"imgBase64": imgBase64
				}
				HTTPResponse = await inviaRichiesta("POST", "/saveBase64", params)
				break
			default:
				break
		}
		if (HTTPResponse.status == 200) {
			alert("Upload eseguito correttamente")
			getUsers()
		}
		else
			alert(HTTPResponse.status + " : " + HTTPResponse.err)
	})
}


function base64Convert(blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		// restituisce un oggetto IMAGE in formato base 64
		reader.readAsDataURL(blob);

		//reader.addEventListener("load", function () {
		reader.onload = function () {
			resolve(reader.result);
		};

		reader.onerror = function (error) {
			reject(error);
		};
	})
}


/* *********************** resizeAndConvert() ****************************** */

/* riceve un FILE OBJECT (BLOB) e restituisce una immagine base64 con resize  */

function resizeAndConvert(img) {  /*

   step 1: conversione in base64 (tramite FileReader) del file scelto dall'utente
   step 2: assegnazione del file base64 ad un oggetto Image da passare alla libr pica
   step 3: resize mediante la libreria pica che restituisce un canvas
   step 4: conversione del canvas in blob
   step 5: conversione del blob in base64 da inviare al server                */

	return new Promise(function (resolve, reject) {
		const WIDTH = 640;
		const HEIGHT = 480;
		let type = img.type;
		let reader = new FileReader();
		reader.readAsDataURL(img)
		reader.onload = function () {
			let image = new Image()
			image.src = reader.result
			image.onload = function () {
				if (image.width < WIDTH && image.height < HEIGHT)
					resolve(reader.result);
				else {
					let canvas = document.createElement("canvas");
					if (image.width > image.height) {
						canvas.width = WIDTH;
						canvas.height = image.height * (WIDTH / image.width)
					} else {
						canvas.height = HEIGHT
						canvas.width = image.width * (HEIGHT / image.height)
					}
					let _pica = new pica()
					_pica.resize(image, canvas, {
						unsharpAmount: 80,
						unsharpRadius: 0.6,
						unsharpThreshold: 2
					})
						.then(function (resizedImage) {
							// resizedImage è restituita in forma di canvas
							_pica.toBlob(resizedImage, type, 0.90)
								.then(function (blob) {
									var reader = new FileReader();
									reader.readAsDataURL(blob);
									reader.onload = function () {
										resolve(reader.result); //base 64
									}
								})
								.catch(err => reject(err))
						})
						.catch(function (err) { reject(err) })
				}
			}
		}
	})
}
