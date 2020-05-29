const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt')


/**
 * Modelo para los usuarios con los campos de
 * 'email', 'nombre', 'password',
 * 'token', 'expira' e 'imagen'.
*/
const usuariosSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true
	},
	nombre: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true,
		trim: true
	},
	token: String,
	expira: Date,
	imagen: String
})

// encriptar contraseña
usuariosSchema.pre('save', async function(next) {
	// no encriptar la contraseña si ya lo esta
	if(!this.isModified('password')) return next()
	// encriptar la contraseña
	const hash = await bcrypt.hash(this.password, 12)
	this.password = hash
	next()
})

// revisar por usuarios duplicados
usuariosSchema.post('save', function(error, doc, next) {
	if(error.name === 'MongoError' && error.code === 11000) {
		next('Email ya registrado')
	} else {
		next(error)
	}
})

// autenticar usuario
usuariosSchema.methods = {
	compararPassword: function(password) {
		return bcrypt.compareSync(password, this.password)
	}
}

// exportar modelo 'Usuarios'
module.exports = mongoose.model('Usuarios', usuariosSchema)
