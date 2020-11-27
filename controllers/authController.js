const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')

exports.autenticarUsuario = passport.authenticate('local', {
	successRedirect: '/administracion',
	failureRedirect: '/iniciar-sesion',
	failureFlash: true,
	badRequestMessage: 'Campos obligatorios'
})

exports.verificarUsuario = (req, res, next) => {
	if(req.isAuthenticated()) return next()
	res.redirect('/iniciar-sesion')
}

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

exports.cerrarSesion = (req, res) => {
	req.logout()
	req.flash('correcto', 'Sesión cerrada correctamente. Vuelve cuando quieras!')
	return res.redirect('/iniciar-sesion')
}
