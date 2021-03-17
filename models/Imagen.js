const mongoose = require('mongoose')
mongoose.Promise = global.Promise

/**
 * Modulo que contiene el modelo de la imagen
 *
 * @module models/Imagen
*/

const ImagenSchema = new mongoose.Schema({
	secure_url: String,
	public_id: String,
	created_at: Date,
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'Usuarios'
	}
})

module.exports = mongoose.model('Imagen', ImagenSchema)
