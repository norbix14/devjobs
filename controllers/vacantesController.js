const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Cv = mongoose.model('Cv')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const shortid = require('shortid')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs-extra')


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * renderizar el formulario para agregar nueva vacante
*/
exports.formularioNuevaVacante = (req, res) => {
	res.render('nueva-vacante', {
		nombrePagina: 'Nueva vacante',
		tagline: 'Completa el formulario y publica tu vacante',
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * agregar una vacante en la base de datos y redireccionar
 * a su url
*/
exports.agregarVacante = async (req, res) => {
	const vacante = new Vacante(req.body)
	// crear referencia
	vacante.autor = req.user._id
	// crear array de habilidades (skills)
	vacante.skills = req.body.skills.split(',')
	const nuevaVacante = await vacante.save()
	req.flash('correcto', 'Vacante creada correctamente. Mira como quedó!')
	res.redirect(`/vacantes/${nuevaVacante.url}`)
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de 
 * error
 *
 * renderizar pagina de la vacante
*/
exports.mostrarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor')
	if(!vacante) return next()
	res.render('vacante', {
		vacante,
		nombrePagina: vacante.titulo,
		barra: true
	})
}


/**
 * @param storage contiene 'destination' con informacion sobre en que carpeta se
 * cargaran los archivos PDF, 'filename' con informacion del propio archivo PDF
 * @param fileFilter verifica si el archivo cumple con los requisitos que le
 * hayamos pasado
 * @param limits limita el tamaño del archivo en 500kb
*/
const configuracionMulter = {
	limits: {
		fileSize: 512000
	},
	storage: fileStorage = multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, __dirname + '../../public/uploads/cv')
		},
		filename: (req, file, callback) => {
			const fileParts = file.mimetype.split('/')
			const fileType = fileParts[0]
			const fileExt = fileParts[1]
			const fileIdentif = `${fileType}_${fileExt}`
			const fileUniqueName = `${shortid.generate()}-${uuidv4()}`
			const archivoFinal = `${fileIdentif}_${fileUniqueName}.${fileExt}`
			callback(null, archivoFinal)
		}
	}),
	fileFilter: (req, file, callback) => {
		if(file.mimetype === 'application/pdf') {
			callback(null, true)
		} else {
			callback(new Error('Formato de archivo no válido'), false)
		}
	}
}
const upload = multer(configuracionMulter).single('cv')


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de 
 * error
 *
 * validar el curriculum subido
*/
exports.subirCv = (req, res, next) => {
	upload(req, res, function(error) {
		if(error) {
			if(error instanceof multer.MulterError) {
				if(error.code === 'LIMIT_FILE_SIZE') {
					req.flash('error', 'El archivo es muy grande. Solo hasta 500kb')
				} else {
					req.flash('error', error.message)
				}
			} else {
				req.flash('error', error.message)
			}
			return res.redirect('back')
		} else {
			return next()
		}
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de 
 * error
 *
 * almacenar los candidatos en la base de datos
*/
exports.contactar = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url })
	if(!vacante) return next()
	const nuevoCandidato = {
		nombre: req.body.nombre,
		email: req.body.email,
		cv: req.file.filename,
		vacante: vacante._id
	}
	vacante.candidatos.push(nuevoCandidato)
	const cv = new Cv(nuevoCandidato)
	await cv.save()
	await vacante.save()
	req.flash('correcto', 'Gracias, tus datos fueron enviados')
	res.redirect('/')
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 * 
 * renderizar el formulario para editar la vacante
*/
exports.formEditarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url })
	if(!vacante) return next()
	res.render('editar-vacante', {
		vacante,
		nombrePagina: `Editar ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * guardar la vacante editada en la base de datos y redireccionar 
 * a su url
*/
exports.editarVacante = async (req, res) => {
	const vacanteActualizada = req.body
	vacanteActualizada.skills = req.body.skills.split(',')
	const vacante = await Vacante.findOneAndUpdate(
	{
		url: req.params.url
	},
	vacanteActualizada,
	{
		new: true,
		runValidators: true
	})
	req.flash('correcto', 'Vacante editada correctamente. Mira como quedó!')
	res.redirect(`/vacantes/${vacante.url}`)
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 *
 * validar y sanitizar los campos de las nuevas vacantes
*/
exports.validarVacante = async (req, res, next) => {
	// sanitizar los campos
	const campos = [
		body('titulo').not().isEmpty().withMessage('El titulo es obligatorio').escape(),
		body('empresa').not().isEmpty().withMessage('La empresa es obligatoria').escape(),
		body('ubicacion').not().isEmpty().withMessage('La ubicación es obligatoria').escape(),
		body('salario').escape(),
		body('contrato').not().isEmpty().withMessage('El contrato es obligatorio').escape(),
		body('skills').not().isEmpty().withMessage('Elige al menos una habilidad').escape()
	]
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
	//si hay 'errores' | si 'errores' NO esta vacio
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva vacante',
			tagline: 'Completa el formulario y publica tu vacante',
			cerrarSesion: true,
			nombre: req.user.nombre,
			imagen: req.user.imagen,
            mensajes: req.flash()
        })
        return
    }
    //si toda la validacion es correcta, continuar al siguiente middleware
    next()
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * eliminar la vacante de la base de datos
*/
exports.eliminarVacante = async (req, res) => {
	const vacante = await Vacante.findById(req.params.id)
	if(verificarAutor(vacante, req.user)) {
		// el autor puede eliminar su propia publicacion nomas
		await vacante.remove()
		res.status(200).send('Vacante eliminada correctamente')
	} else {
		// el autor no puede eliminar publicaciones de otros
		res.status(403).send('Error. Acción prohibida')
	}
}


/**
 * @param vacante objeto con los datos de la vacante
 * @param usuario objeto con los datos del usuario autenticado
 *
 * @return retorna 'true/false' ya que verifica que el autor sea
 * dueño de una publicacion
*/
const verificarAutor = (vacante = {}, usuario = {}) => {
	if(!vacante.autor.equals(usuario._id)) {
		return false
	}
	return true
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 *
 * mostrar los candidatos por cada vacante
*/
exports.mostrarCandidatos = async (req, res, next) => {
	const vacante = await Vacante.findById(req.params.id)
	if(vacante.autor.toString() !== req.user._id.toString()) return next()
	if(!vacante) return next()
	res.render('candidatos', {
		nombrePagina: `Candidatos de ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		candidatos: vacante.candidatos
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * buscador de vacantes
*/
exports.buscarVacantes = async (req, res) => {
	const vacantes = await Vacante.find({
		$text: {
			$search: req.body.q
		}
	})
	res.render('home', {
		nombrePagina: `Resultados para: ${req.body.q}`,
		barra: true,
		vacantes
	})
}

