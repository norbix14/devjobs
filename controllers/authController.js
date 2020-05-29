const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')


/**
 * autenticar usuario
*/
exports.autenticarUsuario = passport.authenticate('local', {
	successRedirect: '/administracion',
	failureRedirect: '/iniciar-sesion',
	failureFlash: true,
	badRequestMessage: 'Campos obligatorios'
})


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de 
 * error
 *
 * verificar que el usuario se encuentre autenticado
*/
exports.verificarUsuario = (req, res, next) => {
	if(req.isAuthenticated()) return next()
	res.redirect('/iniciar-sesion')
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * mostrar el panel de administracion con todas las vacantes 
 * publicadas
*/
exports.mostrarPanel = async (req, res) => {
	const vacantes = await Vacante.find({ autor: req.user._id })
	res.render('administracion', {
		nombrePagina: 'Panel de administración',
		tagline: 'Crea y administra tus vacantes desde aquí',
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		vacantes
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * cerrar la sesion
*/
exports.cerrarSesion = (req, res) => {
	req.logout()
	req.flash('correcto', 'Sesión cerrada correctamente. Vuelve cuando quieras!')
	return res.redirect('/iniciar-sesion')
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * mostrar formulario para reestablecer la contraseña
*/
exports.formReestablecerPassword = (req, res) => {
	res.render('reestablecer-password', {
		nombrePagina: 'Reestablecer contraseña',
		tagline: 'Ingresa tu email para poder reestablecer tu contraseña'
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * generar token para reestablecer la contraseña
*/
exports.enviarToken = async (req, res) => {
	const usuario = await Usuarios.findOne({ email: req.body.email })
	if(!usuario) {
		req.flash('error', 'Este email no esta registrado')
		return res.redirect('/iniciar-sesion')
	}
	usuario.token = crypto.randomBytes(20).toString('hex')
	usuario.expira = Date.now() + 3600000
	await usuario.save()
	const resetUrl = `https://${req.headers.host}/reestablecer-password/${usuario.token}`
	const emailEnviado = await enviarEmail.enviar({
		usuario,
		subject: 'Reestablecer contraseña',
		resetUrl,
		archivo: 'reset'
	})
	if(emailEnviado.ok) {
		req.flash('correcto', emailEnviado.message)
		res.redirect('/iniciar-sesion')
	} else {
		req.flash('error', emailEnviado.message)
		res.redirect('/iniciar-sesion')
	}
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * validar si el token es valido y el usuario existe
*/
exports.reestablecerPassword = async (req, res) => {
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: {
			$gt: Date.now()
		}
	})
	if(!usuario) {
		req.flash('error', 'Este formulario ya no es válido')
		return res.redirect('/reestablecer-password')
	}
	res.render('nuevo-password', {
		nombrePagina: 'Ingresa tu nueva contraseña',
		nombre: usuario.nombre
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * guardar la nueva contraseña
*/
exports.guardarPassword = async (req, res) => {
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: {
			$gt: Date.now()
		}
	})
	// si no existe el usuario o el token ya expiro
	if(!usuario) {
		req.flash('error', 'Esta acción ya no es válida')
		res.redirect('/reestablecer-password')
	}
	usuario.password = req.body.password
	usuario.token = undefined
	usuario.expira = undefined
	await usuario.save()
	req.flash('correcto', 'La contraseña se actualizó correctamente')
	res.redirect('/iniciar-sesion')
}


