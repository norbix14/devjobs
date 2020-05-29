// Ayuda para la carga de archivos

exports.postXHR = (form, url, loader) => {
	let formData = new FormData(form)

	let xhr = new XMLHttpRequest()

	xhr.upload.onprogress = function(e) {
		// llenar el loader aqui
		console.log(`Se han cargado ${e.loaded} de ${e.total} bytes`)
	}

	xhr.upload.onload = function() {
		console.log('Subida completada')
	}

	xhr.upload.onerror = function() {
		console.log(`Error durante la carga: ${xhr.status}`)
	}

	xhr.open('POST', url)

	xhr.send(formData)
}
