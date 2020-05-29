const mongoose = require('mongoose')
mongoose.Promise = global.Promise


/**
* Modelo para las imagenes de perfil del usuario
* con los campos de 'secure_url', 'public_id',
* 'created_at' y 'owner'.
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
