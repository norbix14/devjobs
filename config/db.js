require('dotenv').config()
const mongoose = require('mongoose')

/**
 * Modulo que establece la conexion a la base de datos
 * 
 * @module config/db
*/

try {
	const uri = process.env.MONGODB_DATABASE
	const options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	}
	mongoose.connect(uri, options)
	mongoose.connection.on('connected', () => console.log('Conectado a MongoDB'))
	mongoose.connection.on('error', (error) => console.log('Error al conectar a MongoDB'))
} catch (err) {
	console.log('Ha ocurrido un error con MongoDB')
}

require('../models/Usuarios')
require('../models/Vacantes')
require('../models/Imagen')
require('../models/Cv')
