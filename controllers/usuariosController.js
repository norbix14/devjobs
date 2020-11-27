require('dotenv').config({ path: 'variables.env' })
const mongoose = require('mongoose')
const sha1 = require('sha1')
const { body, validationResult } = require('express-validator')
const Cloudinary = require('../handlers/cloudinary')
const Usuarios = mongoose.model('Usuarios')
const Imagen = mongoose.model('Imagen')

exports.obtenerCloudCred = (req, res) => {
	let data = {
		key: process.env.CLOUDINARY_API_KEY,
		url: process.env.CLOUDINARY_URL_FRONTEND,
		signature: sha1(req.params.fileinfo + process.env.CLOUDINARY_API_SECRET)
	}
	res.status(200).send(data)
}

exports.guardarImagenPerfilCliente = async (req, res) => {
	const usuario = await Usuarios.findById(req.user._id)
	if(!usuario) {
		req.flash('error', 'No se ha encontrado ningún usuario')
		return res.redirect('/administracion')
	} else {
		const owner = usuario._id
		const { secure_url, public_id, created_at } = req.body
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
	}
}

exports.cambiarImagenPerfil = async (req, res) => {
	const imagen = await Imagen.findOne({
		public_id: req.params.publicid
	})
	const usuario = await Usuarios.findByIdAndUpdate(req.user._id, {
		imagen: imagen.secure_url
	})
	if(usuario) {
		return res.status(200).send('Tu imagen de perfil se actualizó correctamente')
	} else {
		return res.send('No se ha podido actualizar la imagen de perfil')
	}
}

exports.eliminarImagen = async (req, res) => {
	const imagen = await Imagen.findOne({
		public_id: req.params.publicid
	})
	const eliminarCloud = await Cloudinary.eliminarImagen(imagen._id)
	if(eliminarCloud.ok) {
		res.status(200).send(eliminarCloud.message)
	} else {
		res.send(eliminarCloud.message)
	}
}

exports.eliminarCloudinary = async (req, res) => {
	const eliminarCloud = await Cloudinary.eliminarCloudinary(req.params.publicid)
	if(eliminarCloud.ok) {
		res.status(200).send(eliminarCloud.message)
	} else {
		res.send(eliminarCloud.message)
	}
}

exports.formSubirImagen = async (req, res) => {
	const imagenes = await Imagen.find({
		owner: req.user._id
	})
	res.render('subir-imagen-perfil', {
		nombrePagina: 'Subir o actualizar imagen de perfil',
		tagline: 'Aquí podrás ver tus imagenes de perfil cargadas',
		usuario: req.user,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		imagenes
	})
}

exports.formCrearCuenta = (req, res) => {
	res.render('crear-cuenta', {
		nombrePagina: 'Crear cuenta en devJobs',
		tagline: 'Comienza a publicar tus vacantes'
	})
}

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

exports.crearUsuario = async (req, res) => {
	try {
		const usuario = new Usuarios(req.body)
		await usuario.save()
		req.flash('correcto', 'Cuenta creada. Ingresa y ve las vacantes')
		return res.redirect('/iniciar-sesion')
	} catch(e) {
		console.log(e)
		req.flash('error', 'No se ha podido crear la cuenta')
		return res.redirect('/crear-cuenta')
	}
}

exports.formIniciarSesion = (req, res) => {
	res.render('iniciar-sesion', {
		nombrePagina: 'Iniciar sesión'
	})
}

exports.formEditarPerfil = (req, res) => {
	res.render('editar-perfil', {
		nombrePagina: 'Editar perfil',
		usuario: req.user,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen
	})
}

exports.editarPerfil = async (req, res) => {
	const usuario = await Usuarios.findById(req.user._id)
	usuario.nombre = req.body.nombre
	usuario.email = req.body.email
	if(req.body.password) {
		usuario.password = req.body.password
	}
	await usuario.save()
	req.flash('correcto', 'Tu perfil se modificó correctamente')
	res.redirect('/administracion')
}

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
			}
		)
	}
  next()
}
