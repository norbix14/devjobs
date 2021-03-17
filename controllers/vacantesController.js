const { model } = require('mongoose')
const { body, validationResult } = require('express-validator')
const Vacante = model('Vacante')
const Cv = model('Cv')

/**
 * Modulo para manejar las acciones con las vacantes
 * 
 * @module controllers/vacantesController
*/

/**
 * Funcion para verificar el autor de una vacante
 * 
 * @param {object} vacante - vacancy data
 * @param {object} usuario - user data
 * @returns {boolean}
*/
const verificarAutor = (vacante = {}, usuario = {}) => {
	const { autor = '' } = vacante
	const { _id = '' } = usuario
	if(!autor.equals(_id)) {
		return false
	}
	return true
}

/**
 * Funcion para mostrar un formulario para crear una nueva vacante
 * 
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.formularioNuevaVacante = (req, res) => {
	const { user = {} } = req
	const { nombre, imagen } = user
	res.render('nueva-vacante', {
		nombrePagina: 'Nueva vacante',
		tagline: 'Completa el formulario y publica tu vacante',
		cerrarSesion: true,
		nombre,
		imagen
	})
}

/**
 * Funcion para agregar una nueva vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.agregarVacante = async (req, res) => {
	const { body, user = {} } = req
	const { _id = '' } = user
	const vacante = new Vacante(body)
	vacante.autor = _id
	vacante.skills = body.skills.split(',')
	try {
		const { url } = await vacante.save()
		req.flash('correcto', 'Vacante creada correctamente')
		return res.redirect(`/vacantes/${url}`)
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		return res.redirect('/')
	}
}

/**
 * Funcion para mostrar una vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.mostrarVacante = async (req, res, next) => {
	const { params } = req
	const { url } = params
	try {
		const vacante = await Vacante.findOne({ url }).populate('autor')
		if (!vacante) return next()
		return res.render('vacante', {
			vacante,
			nombrePagina: vacante.titulo,
			barra: true
		})
	} catch (err) {
		return res.render('vacante', {
			vacante: [],
			nombrePagina: 'Vacante ausente',
			barra: true
		})
	}
}

/**
 * Funcion para guardar los datos del postulante en la BBDD
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.contactar = async (req, res, next) => {
	const { params, body: reqbody } = req
	const { url } = params
	const { nombre, email, cv } = reqbody
	try {
		const vacante = await Vacante.findOne({ url })
		if (!vacante) return next()
		const campos = [
			body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
			body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
			body('cv').isURL().withMessage('La URL es obligatoria')
		]
		await Promise.all(campos.map(campo => campo.run(req)))
		const errores = validationResult(req)
		if (errores.isEmpty()) {
			const nuevoCandidato = {
				nombre,
				email,
				cv,
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
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		return res.redirect('/')
	}
}

/**
 * Funcion para mostrar un formulario para editar una vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.formEditarVacante = async (req, res, next) => {
	const { params, user = {} } = req
	const { url } = params
	const { _id, nombre, imagen } = user
	try {
		const vacante = await Vacante.findOne({ url })
		if (!vacante) return next()
		if (vacante.autor.toString() === _id.toString()) {
			res.render('editar-vacante', {
				vacante,
				nombrePagina: `Editar ${vacante.titulo}`,
				cerrarSesion: true,
				nombre,
				imagen
			})
		} else {
			req.flash('error', 'Esta vacante no te pertenece y no la puedes editar')
			res.redirect('/')
		}
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		res.redirect('/')
	}
}

/**
 * Funcion para editar una vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.editarVacante = async (req, res) => {
	const { body, params } = req
	const { url } = params
	const vacanteActualizada = body
	vacanteActualizada.skills = body.skills.split(',')
	try {
		const vacante = await Vacante.findOneAndUpdate(
			{
				url
			},
			vacanteActualizada,
			{
				new: true,
				runValidators: true
			}
		)
		req.flash('correcto', 'Vacante editada correctamente')
		res.redirect(`/vacantes/${vacante.url}`)
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		res.redirect('/')
	}
}

/**
 * Funcion para validar una vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
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

/**
 * Funcion para eliminar una vacante de la BBDD
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.eliminarVacante = async (req, res) => {
	const { params, user = {} } = req
	const { id } = params
	try {
		const vacante = await Vacante.findById(id)
		if (verificarAutor(vacante, user)) {
			await Cv.deleteMany({ vacante: id })
			await vacante.remove()
			return res.status(200).send('Vacante eliminada correctamente')
		} else {
			return res.status(403).send('Error. Acción prohibida')
		}
	} catch (err) {
		return res.status(500).send('Ha ocurrido un error')
	}
}

/**
 * Funcion para mostrar los candidatos de una vacante
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.mostrarCandidatos = async (req, res, next) => {
	const { params, user = {} } = req
	const { id } = params
	const { _id, nombre, imagen } = user
	try {
		const vacante = await Vacante.findById(id)
		if (!vacante) return next()
		const { autor, titulo, candidatos } = vacante
		if (autor.toString() !== _id.toString()) return next()
		return res.render('candidatos', {
			nombrePagina: `Candidatos de ${titulo}`,
			cerrarSesion: true,
			nombre,
			imagen,
			candidatos
		})
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		return res.redirect('/')
	}
}

/**
 * Funcion para buscar vacantes
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.buscarVacantes = async (req, res) => {
	const { body } = req
	const { q = '' } = body
	try {
		const vacantes = await Vacante.find({
			$text: {
				$search: q
			}
		})
		return res.render('home', {
			nombrePagina: `Resultados para: ${q}`,
			barra: true,
			vacantes
		})
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		return res.redirect('/')
	}
}
