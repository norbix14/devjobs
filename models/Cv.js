const mongoose = require('mongoose')
mongoose.Promise = global.Promise

/**
 * Modulo que contiene el modelo del CV
 * 
 * @module models/Cv
*/

const CvSchema = new mongoose.Schema({
	nombre: String,
	email: String,
	cv: String,
	vacante: {
		type: mongoose.Schema.ObjectId,
		ref: 'Vacante'
	}
})

module.exports = mongoose.model('Cv', CvSchema)
