const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const {
	encryptPassword,
	comparePassword
} = require('../helpers/passwordHandler')

/**
 * Modulo que contiene el modelo del usuario
 *
 * @module models/Usuarios
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

usuariosSchema.pre('save', function(next) {
	if(!this.isModified('password')) return next()
	const hashedPass = encryptPassword(this.password)
	this.password = hashedPass
	next()
})

usuariosSchema.post('save', function(error, doc, next) {
	if(error.name === 'MongoError' && error.code === 11000) {
		next('Email ya registrado')
	} else {
		next(error)
	}
})

usuariosSchema.methods = {
	compararPassword: function(password) {
		return comparePassword(password, this.password)
	}
}

module.exports = mongoose.model('Usuarios', usuariosSchema)
