const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slug')
const shortid = require('shortid')


/**
 * Modelo para las vacantes con los campos:
 * 'titulo', 'empresa', 'ubicacion', 'salario', 'contrato',
 * 'descripcion', 'url', 'skills' y 'candidatos'.
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

// antes de guardar se genera una cadena aleatoria al final de la url
vacantesSchema.pre('save', function(next) {
	const url = slug(this.titulo)
	this.url = `${url}-${shortid.generate()}`
	next()
})

// crear un indice para las busquedas (mas rapido)
vacantesSchema.index({ titulo: 'text' })

// exportar modelo 'Vacante'
module.exports = mongoose.model('Vacante', vacantesSchema)
