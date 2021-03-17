const { model } = require('mongoose')
const Vacante = model('Vacante')

/**
 * Modulo para manejar el contenido de la
 * pagina de inicio
 * 
 * @module controllers/homeController
*/

/**
 * Funcion para mostrar vacantes diponibles
 * 
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.mostrarTrabajos = async (req, res, next) => {
	try {
		const vacantes = await Vacante.find()
		if (!vacantes) return next()
		return res.render('home', {
			nombrePagina: 'devJobs',
			tagline: 'Encuentra y publica trabajos para desarrolladores',
			barra: true,
			boton: true,
			vacantes
		})
	} catch (err) {
		return res.render('home', {
			nombrePagina: 'devJobs',
			tagline: 'Encuentra y publica trabajos para desarrolladores',
			barra: true,
			boton: true,
			vacantes: []
		})
	}
}
