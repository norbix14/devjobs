const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 * 
 * Renderiza todas las vacantes en el inicio
*/
exports.mostrarTrabajos = async (req, res, next) => {
	const vacantes = await Vacante.find()
	if(!vacantes) return next()
	res.render('home', {
		nombrePagina: 'devJobs',
		tagline: 'Encuentra y publica trabajos para desarrolladores',
		barra: true,
		boton: true,
		vacantes
	})
}


