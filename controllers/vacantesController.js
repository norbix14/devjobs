const mongoose = require('mongoose')
const multer = require('multer')
const shortid = require('shortid')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs-extra')
const path = require('path')
const { body, validationResult } = require('express-validator')
const Vacante = mongoose.model('Vacante')
const Cv = mongoose.model('Cv')

exports.formularioNuevaVacante = (req, res) => {
	res.render('nueva-vacante', {
		nombrePagina: 'Nueva vacante',
		tagline: 'Completa el formulario y publica tu vacante',
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen
	})
}

exports.agregarVacante = async (req, res) => {
	const vacante = new Vacante(req.body)
	vacante.autor = req.user._id
	vacante.skills = req.body.skills.split(',')
	const nuevaVacante = await vacante.save()
	req.flash('correcto', 'Vacante creada correctamente. Mira como quedó!')
	res.redirect(`/vacantes/${nuevaVacante.url}`)
}

exports.mostrarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor')
	if(!vacante) return next()
	res.render('vacante', {
		vacante,
		nombrePagina: vacante.titulo,
		barra: true
	})
}

const configuracionMulter = {
	limits: {
		fileSize: 512000
	},
	storage: fileStorage = multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, path.join(__dirname, '../public/uploads/cv'))
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

exports.contactar = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url })
	if(!vacante) return next()
	const campos = [
	  body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
	  body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
	  body('cv').isURL().withMessage('La URL es obligatoria')
	]
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
  if(errores.isEmpty()) {
		const nuevoCandidato = {
			nombre: req.body.nombre,
			email: req.body.email,
			cv: req.body.cv,
			vacante: vacante._id
		}
		vacante.candidatos.push(nuevoCandidato)
		const cvCandidato = new Cv(nuevoCandidato)
		await cvCandidato.save()
		await vacante.save()
		req.flash('correcto', 'Gracias, tus datos fueron enviados')
		return res.redirect('/')
  } else {
    req.flash('error', errores.array().map(error => error.msg))
		return res.redirect('/')
  }
}

exports.formEditarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url })
	if(!vacante) return next()
	if(vacante.autor.toString() === req.user._id.toString()) {
		res.render('editar-vacante', {
			vacante,
			nombrePagina: `Editar ${vacante.titulo}`,
			cerrarSesion: true,
			nombre: req.user.nombre,
			imagen: req.user.imagen
		})
	} else {
		req.flash('error', 'Esta vacante no te pertenece y no la puedes editar')
		res.redirect('/')
	}
}

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
		}
	)
	req.flash('correcto', 'Vacante editada correctamente. Mira como quedó!')
	res.redirect(`/vacantes/${vacante.url}`)
}

exports.validarVacante = async (req, res, next) => {
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
	if(!errores.isEmpty()) {
	  req.flash('error', errores.array().map(error => error.msg))
	  return res.render('nueva-vacante', {
	    nombrePagina: 'Nueva vacante',
			tagline: 'Completa el formulario y publica tu vacante',
			cerrarSesion: true,
			nombre: req.user.nombre,
			imagen: req.user.imagen,
	    mensajes: req.flash()
	  })
	}
  next()
}

exports.eliminarVacante = async (req, res) => {
	const vacante = await Vacante.findById(req.params.id)
	if(verificarAutor(vacante, req.user)) {
		await vacante.remove()
		res.status(200).send('Vacante eliminada correctamente')
	} else {
		res.status(403).send('Error. Acción prohibida')
	}
}

const verificarAutor = (vacante = {}, usuario = {}) => {
	if(!vacante.autor.equals(usuario._id)) {
		return false
	}
	return true
}

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
