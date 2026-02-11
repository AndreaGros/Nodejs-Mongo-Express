"use strict"

$(document).ready(function () {


	let _login = $("#login")
	let _mail = $("#mail")

	let _username = $("#usr")
	let _password = $("#pwd")
	let _lblErrore = $("#lblErrore")
	let btnLogin = $("#btnLogin")

	let _txtTo = $("#txtTo")
	let _txtSubject = $("#txtSubject")
	let _txtMessage = $("#txtMessage")
	let _txtAttachment = document.getElementById("txtAttachment")
	console.log(_txtAttachment)
	let _btnInvia = $("#btnInvia");

	let _tbody = $('tbody')[0]

	let username = ''

	_mail.hide()

	_lblErrore.hide();
	_lblErrore.children("button").on("click", function () {
		_lblErrore.hide();
	})

	$(btnLogin).on('click', async function () {
		const HTTPResponse = await inviaRichiesta('POST', '/login', { 'username': _username.val(), 'password': _password.val() })
		if (HTTPResponse.status == 200) {
			username = HTTPResponse.data.username
			alert("Login riuscito")
			_login.hide()
			_mail.show()
			let mails = HTTPResponse.data.mail
			for (const mail of mails) {
				const tr = document.createElement('tr')
				_tbody.append(tr)

				let td = document.createElement('td')
				td.textContent = mail.from
				tr.append(td)

				td = document.createElement('td')
				td.textContent = mail.subject
				tr.append(td)

				td = document.createElement('td')
				td.textContent = mail.body
				tr.append(td)

				td = document.createElement('td')
				let a = document.createElement('a')
				a.textContent = mail.attachment
				a.href = "#"
				a.addEventListener("click", async () => {
					openImg(a.textContent)
				})
				td.append(a)
				tr.append(td)
			}
		}
		else {
			if (HTTPResponse.status == 401)
				_lblErrore.show()
			else
				alert(HTTPResponse.status + " : " + HTTPResponse.err)
		}
	})

	$(_btnInvia).on('click', async function () {
		let blob = _txtAttachment.files[0]
		let formData = new FormData()
		formData.append("to", _txtTo.val())
		formData.append("subject", _txtSubject.val())
		formData.append("message", _txtMessage.val())
		if (blob)
			formData.append("attachment", blob)
		formData.append("from", username)
		console.log(formData)
		const HTTPResponse = await inviaRichiesta("POST", "/send", formData)
		if (HTTPResponse.status == 200) {

		}
		else {
			if (HTTPResponse.status == 503)
				alert("Utente inesistente")
			else
				alert(HTTPResponse.status + " : " + HTTPResponse.err)
		}
	})

	function openImg(fileName) {
		let img = `./img/${fileName}`
		window.open(img, "_blank")
	}


});

