const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { model } = require('mongoose')
const Usuarios = model('Usuarios')

/**
 * Modulo que se encarga de la autenticacion del usuario
 * 
 * @module config/passport
*/

passport.use(new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password'
	},
	async (email, password, done) => {
		const usuario = await Usuarios.findOne({ email })
		if(!usuario) {
			return done(null, false, {
				message: 'Este email no pertenece a ninguna cuenta'
			})
		}
		const verificarPass = usuario.compararPassword(password)
		if(!verificarPass) {
			return done(null, false, {
				message: 'Credenciales incorrectas. Revisa tus datos'
			})
		}
		return done(null, usuario)
	}
))

passport.serializeUser((usuario, done) => done(null, usuario._id))

passport.deserializeUser(async (id, done) => {
	const usuario = await Usuarios.findById(id).exec()
	return done(null, usuario)
})

module.exports = passport
