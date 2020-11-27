const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcryptjs')

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
	const salt = bcrypt.genSaltSync()
	const hashedPass = bcrypt.hashSync(this.password, salt)
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
		return bcrypt.compareSync(password, this.password)
	}
}

module.exports = mongoose.model('Usuarios', usuariosSchema)
