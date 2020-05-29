const mongoose = require('mongoose')
mongoose.Promise = global.Promise


/**
* Modelo para el CV del usuario con los campos de 
* 'nombre', 'email', 'cv' y 'vacante' con la _id 
* de la vacante a la que se postulo.
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
