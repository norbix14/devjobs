const mongoose = require('mongoose')
require('dotenv').config({ path: 'variables.env' })

// Conectar con MongoDB Atlas
mongoose.connect(process.env.MONGO_DATABASE, {
	// 'flags' para no mostrar alertas en consola
	// de opciones deprecadas
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
})
// Mostrar algun error con la conexion a la base de datos
mongoose.connection.on('error', error => {
	console.log('Error al conectar con MongoDB', error)
})
// importar modelos
require('../models/Usuarios')
require('../models/Vacantes')
require('../models/Imagen')
require('../models/Cv')
