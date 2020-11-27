require('dotenv').config({ path: 'variables.env' })
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_DATABASE, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
})

mongoose.connection.on('error', error => {
	console.log('Error al conectar con MongoDB')
})

require('../models/Usuarios')
require('../models/Vacantes')
require('../models/Imagen')
require('../models/Cv')
