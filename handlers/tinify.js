require('dotenv').config({ path: 'variables.env' })
const tinify = require('tinify')
tinify.key = process.env.TINIFY_KEY

exports.tinifyImage = async (desde, hacia) => {
	let resultado = {
		ok: true,
		message: 'Optimizado correctamente'
	}
	await tinify.fromFile(desde).toFile(hacia, err => {
		resultado.ok = false
		if(err instanceof tinify.AccountError) {
			resultado.message = 'Error con la cuenta'
		} else if(err instanceof tinify.ClientError) {
			resultado.message = 'Error en los datos enviados'
		} else if(err instanceof tinify.ServerError) {
			resultado.message = 'Error con el servidor'
		} else if(err instanceof tinify.ConnectionError) {
			resultado.message = 'Error en la red'
		} else {
			resultado.message = 'Error inesperado'
		}
	})
	return resultado
}

