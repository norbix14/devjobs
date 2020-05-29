const tinify = require('tinify')
require('dotenv').config({ path: 'variables.env' })
tinify.key = process.env.TINIFY_KEY


/**
 * @param desde es el archivo que se quiere optimizar
 * @param hacia es la carpeta que tendra el archivo optimizado
 * @return retorna un objeto con las claves de: 
 * 'ok': 'boolean' y 'message': 'string'.
 * son datos con informacion del resultado de la operacion y un mensaje para el
 * cliente con el resultado de la operacion o algun mensaje de error.
 *
 * comprime y optimiza una imagen jpeg o png
*/
exports.tinifyImage = async (desde, hacia) => {
	const resultado = {}
	try {
		await tinify.fromFile(desde).toFile(hacia)
		resultado.ok = true
		resultado.message = 'Optimizado correctamente'
	} catch(e) {
		switch (e) {
			case AccountError:
				resultado.ok = false
				resultado.message = 'Error con la cuenta'
				break
			case ClientError:
				resultado.ok = false
				resultado.message = 'Error en los datos enviados'
				break
			case ServerError:
				resultado.ok = false
				resultado.message = 'Error con el servidor'
				break
			case ConnectionError:
				resultado.ok = false
				resultado.message = 'Error en la red'
				break
			default:
				resultado.ok = false
				resultado.message = 'Ha ocurrido un error inesperado'
				break
		}
	}
	return resultado
}

