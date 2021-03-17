const passport = require('passport')
const { model } = require('mongoose')
const Vacante = model('Vacante')

/**
 * Modulo para manejar la autenticacion
 * 
 * @module controllers/authController
*/

/**
 * Funcion para autenticar al usuario mediante Passport
*/
exports.autenticarUsuario = passport.authenticate('local', {
	successRedirect: '/administracion',
	failureRedirect: '/iniciar-sesion',
	failureFlash: true,
	badRequestMessage: 'Campos obligatorios'
})

/**
 * Funcion para verificar al usuario
 * 
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.verificarUsuario = (req, res, next) => {
	if(req.isAuthenticated()) return next()
	return res.redirect('/iniciar-sesion')
}

/**
 * Funcion para mostrar el panel de administracion
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.mostrarPanel = async (req, res) => {
	const { user = {} } = req
	const { _id, nombre, imagen } = user
	try {
		const vacantes = await Vacante.find({ autor: _id })
		return res.render('administracion', {
			nombrePagina: 'Panel de administración',
			tagline: 'Crea y administra tus vacantes desde aquí',
			cerrarSesion: true,
			nombre,
			imagen,
			vacantes
		})
	} catch (err) {
		return res.render('administracion', {
			nombrePagina: 'Panel de administración',
			tagline: 'Crea y administra tus vacantes desde aquí',
			cerrarSesion: true,
			nombre,
			imagen,
			vacantes: []
		})
	}
}

/**
 * Funcion para cerrar la sesion
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.cerrarSesion = (req, res) => {
	req.logout()
	req.flash('correcto', 'Sesión cerrada correctamente. Vuelve cuando quieras!')
	return res.redirect('/iniciar-sesion')
}
