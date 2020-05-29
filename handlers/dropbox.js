require('isomorphic-fetch')
require('dotenv').config({ path: 'variables.env' })
const Dropbox = require('dropbox').Dropbox

exports.Dropbox = (path) => {
	const dropbox = new Dropbox({ accessToken: process.env.DROPBOX_KEY })
	const resultado = {}
	dropbox.filesListFolder({ path })
	.then(response => {
		resultado.ok = true
		resultado.message = 'Archivo subido correctamente'
		console.log(response)
	})
	.catch(error => {
		resultado.ok = false
		resultado.message = 'Ha ocurrido un error al subir el archivo'
		console.log(error)
	})
	return resultado
}
