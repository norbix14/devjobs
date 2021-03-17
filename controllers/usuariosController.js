require('dotenv').config()
const { model } = require('mongoose')
const sha1 = require('sha1')
const { body, validationResult } = require('express-validator')
const Cloudinary = require('../handlers/cloudinary')
const Usuarios = model('Usuarios')
const Imagen = model('Imagen')

/**
 * Modulo para manejar las acciones de los usuarios
 * 
 * @module controllers/usuariosController
*/

/**
 * Funcion para obtener las credenciales de Cloudinary
 * 
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.obtenerCloudCred = (req, res) => {
	const { params } = req
	const { fileinfo = '' } = params
	const signature = sha1(fileinfo + process.env.CLOUDINARY_API_SECRET)
	const data = {
		key: process.env.CLOUDINARY_API_KEY,
		url: process.env.CLOUDINARY_URL_FRONTEND,
		signature,
	}
	return res.status(200).send(data)
}

/**
 * Funcion para guardar la imagen de perfil
 * 
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.guardarImagenPerfilCliente = async (req, res) => {
	const { body, user = {} } = req
	const { _id = '' } = user
	try {
		const usuario = await Usuarios.findById(_id)
		if (!usuario) {
			req.flash('error', 'No se ha encontrado ningún usuario')
			return res.redirect('/administracion')
		}
		const owner = usuario._id
		const { secure_url, public_id, created_at } = body
		const imagen = new Imagen({
			secure_url,
			public_id,
			created_at,
			owner
		})
		usuario.imagen = secure_url
		await usuario.save()
		await imagen.save()
		return res.status(200).send('Imagen de perfil guardada correctamente')
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		return res.redirect('/administracion')
	}
}

/**
 * Funcion para cambiar la imagen de perfil
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.cambiarImagenPerfil = async (req, res) => {
	const { params, user = {} } = req
	const { publicid = '' } = params
	const { _id = '' } = user
	try {
		const imagen = await Imagen.findOne({
			public_id: publicid
		})
		const usuario = await Usuarios.findByIdAndUpdate(_id, {
			imagen: imagen.secure_url
		})
		if (usuario) {
			return res.status(200).send('Tu imagen de perfil se actualizó correctamente')
		} else {
			return res.status(200).send('No se ha podido actualizar la imagen de perfil')
		}
	} catch (err) {
		return res.status(500).send('Ha ocurrido un error')
	}
}

/**
 * Funcion para eliminar una imagen de la base de datos
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.eliminarImagen = async (req, res) => {
	const { params } = req
	const { publicid = '' } = params
	try {
		const imagen = await Imagen.findOne({
			public_id: publicid
		})
		const eliminarCloud = await Cloudinary.eliminarImagen(imagen._id)
		if (eliminarCloud.ok) {
			return res.status(200).send(eliminarCloud.message)
		} else {
			return res.status(200).send(eliminarCloud.message)
		}
	} catch (err) {
		return res.status(500).send('Ha ocurrido un error')
	}
}

/**
 * Funcion para eliminar una imagen de Cloudinary
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.eliminarCloudinary = async (req, res) => {
	const { params } = req
	const { publicid = '' } = params
	try {
		const eliminarCloud = await Cloudinary.eliminarCloudinary(publicid)
		if (eliminarCloud.ok) {
			return res.status(200).send(eliminarCloud.message)
		} else {
			return res.status(200).send(eliminarCloud.message)
		}
	} catch (err) {
		return res.status(500).send('Ha ocurrido un error')
	}
}

/**
 * Funcion para mostrar un formulario para subir una imagen
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.formSubirImagen = async (req, res) => {
	const { user = {} } = req
	const { _id, nombre, imagen } = user
	try {
		const imagenes = await Imagen.find({
			owner: _id
		})
		return res.render('subir-imagen-perfil', {
			nombrePagina: 'Subir o actualizar imagen de perfil',
			tagline: 'Aquí podrás ver tus imagenes de perfil cargadas',
			usuario: user,
			cerrarSesion: true,
			nombre,
			imagen,
			imagenes
		})
	} catch (err) {
		return res.render('subir-imagen-perfil', {
			nombrePagina: 'Subir o actualizar imagen de perfil',
			tagline: 'Aquí podrás ver tus imagenes de perfil cargadas',
			usuario: user,
			cerrarSesion: true,
			nombre,
			imagen,
			imagenes: []
		})
	}
}

/**
 * Funcion para mostrar un formulario para crear una cuenta
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.formCrearCuenta = (req, res) => {
	res.render('crear-cuenta', {
		nombrePagina: 'Crear cuenta en devJobs',
		tagline: 'Comienza a publicar tus vacantes'
	})
}

/**
 * Funcion para validar un registro
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.validarRegistro = async (req, res, next) => {
	const campos = [
		body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
		body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
		body('password').not().isEmpty().withMessage('La contraseña es obligatoria').escape(),
		body('confirmar').not().isEmpty().withMessage('Debes confirmar la contraseña').escape(),
		body('confirmar').equals(req.body.password).withMessage('Las contraseñas no coinciden')
	]
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
	if(!errores.isEmpty()) {
	  req.flash('error', errores.array().map(error => error.msg))
	  return res.render('crear-cuenta', {
			nombrePagina: 'Crear cuenta en devJobs',
			tagline: 'Comienza a publicar tus vacantes',
			mensajes: req.flash()
	  })
	}
	next()
}

/**
 * Funcion para crear un nuevo usuario
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.crearUsuario = async (req, res) => {
	const { body } = req
	try {
		const usuario = new Usuarios(body)
		await usuario.save()
		req.flash('correcto', 'Cuenta creada. Ingresa y ve las vacantes')
		return res.redirect('/iniciar-sesion')
	} catch (err) {
		req.flash('error', err)
		return res.redirect('/crear-cuenta')
	}
}

/**
 * Funcion para mostrar un formulario para iniciar sesion
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.formIniciarSesion = (req, res) => {
	res.render('iniciar-sesion', {
		nombrePagina: 'Iniciar sesión'
	})
}

/**
 * Funcion para mostrar un formulario para editar el perfil
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.formEditarPerfil = (req, res) => {
	const { user = {} } = req
	const { nombre, imagen } = user
	res.render('editar-perfil', {
		nombrePagina: 'Editar perfil',
		usuario: user,
		cerrarSesion: true,
		nombre,
		imagen
	})
}

/**
 * Funcion para editar el perfil
 *
 * @param {object} req - user request
 * @param {object} res - server response
*/
exports.editarPerfil = async (req, res) => {
	const { body, user = {} } = req
	const { nombre, email, password } = body
	const { _id = '' } = user
	try {
		const usuario = await Usuarios.findById(_id)
		usuario.nombre = nombre
		usuario.email = email
		if (password) {
			usuario.password = password
		}
		await usuario.save()
		req.flash('correcto', 'Tu perfil se modificó correctamente')
		res.redirect('/administracion')
	} catch (err) {
		req.flash('error', 'Ha ocurrido un error')
		res.redirect('/administracion')
	}
}

/**
 * Funcion para validar los nuevos datos del perfil
 *
 * @param {object} req - user request
 * @param {object} res - server response
 * @param {function} next - next function
*/
exports.validarPerfil = async (req, res, next) => {
	const campos = [
	  body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
	  body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
	]
	if(req.body.password) {
		campos.push(body('password').escape())
	}
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
	if(!errores.isEmpty()) {
	  req.flash('error', errores.array().map(error => error.msg))
	  return res.render('editar-perfil', {
			nombrePagina: 'Editar perfil',
			usuario: req.user,
			cerrarSesion: true,
			nombre: req.user.nombre,
			imagen: req.user.imagen,
			mensajes: req.flash()
		})
	}
  next()
}
