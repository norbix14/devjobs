const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slug')
const { nanoid } = require('nanoid')

/**
 * Modulo que contiene el modelo de la vacante
 *
 * @module models/Vacantes
*/

const vacantesSchema = new mongoose.Schema({
	titulo: {
		type: String,
		required: 'Dato obligatorio',
		trim: true
	},
	empresa: {
		type: String,
		trim: true
	},
	ubicacion: {
		type: String,
		trim: true,
		required: 'Dato obligatorio'
	},
	salario: {
		type: String,
		default: 0,
		trim: true
	},
	contrato: {
		type: String,
		trim: true
	},
	descripcion: {
		type: String,
		trim: true
	},
	url: {
		type: String,
		lowercase: true
	},
	skills: [String],
	candidatos: [{
		nombre: String,
		email: String,
		cv: String,
		vacante: {
			type: mongoose.Schema.ObjectId,
			// ref: 'Vacante'
		}
	}],
	autor: {
		type: mongoose.Schema.ObjectId,
		ref: 'Usuarios',
		required: 'El autor es obligatorio'
	}
})

vacantesSchema.pre('save', function(next) {
	const url = slug(this.titulo)
	this.url = `${url}-${nanoid()}`
	next()
})

vacantesSchema.index({ titulo: 'text' })

module.exports = mongoose.model('Vacante', vacantesSchema)
