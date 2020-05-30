const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const Imagen = mongoose.model('Imagen')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const shortid = require('shortid')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs-extra')
const path = require('path')
const Cloudinary = require('../handlers/cloudinary')
const Tinify = require('../handlers/tinify')


/**
 * @param storage contiene 'destination' con informacion sobre en que carpeta se
 * cargaran las imagenes, 'filename' con informacion de la propia imagen
 * @param fileFilter verifica si la imagen cumple con los requisitos que le
 * hayamos pasado
 * @param limits limita el tamaño del archivo en 300kb
*/
const configuracionMulter = {
	limits: {
		fileSize: 512000
	},
	storage: fileStorage = multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, path.join(__dirname, '../public/uploads/perfiles'))
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
		if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
			callback(null, true)
		} else {
			callback(new Error('Formato de imagen no válido'), false)
		}
	}
}
const upload = multer(configuracionMulter).single('imagen')


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 *
 * validar tamaño, formato o mostrar algun error de Multer y si todo
 * es correcto, subir en local y continuar con el siguiente middleware
*/
exports.subirImagen = (req, res, next) => {
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
			return res.redirect('/administracion')
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
 * optimiza la imagen solo si excede los 500kb y la guarda en 
 * una carpeta diferente
*/
exports.optimizarImagen = async (req, res, next) => {
	if(req.file) {
		if(req.file.size >= 491520) {
			const desde = path.join(__dirname, '../public/uploads/perfiles/' + req.file.filename)
			const hacia = path.join(__dirname, '../public/uploads/perfiles/optimizadas/' + req.file.filename)
			const tiny = await Tinify.tinifyImage(desde, hacia)
			if(tiny.ok) {
				return next()
			} else {
				// retorno next() tambien en caso de sobrepasar el limite de optimizaciones
				// console.log('Error con Tinify\n', tiny.message)
				// req.flash('error', tiny.message)
				// return res.redirect('/administracion')
				return next()
			}
		} else {
			return next()
		}
	}
	next()
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * guardar la imagen nueva optimizada en Cloudinary, en caso de haberla subido,
 * y guardar la ruta segura en mongodb
*/
exports.guardarImagenPerfil = async (req, res) => {
	const usuario = await Usuarios.findById(req.user._id)
	if(req.file) {
		let imagen = ''
		const imagenOptimizada = path.join(__dirname, '../public/uploads/perfiles/optimizadas/' + req.file.filename)
		if(fs.existsSync(imagenOptimizada)) {
			imagen = imagenOptimizada
		} else {
			imagen = req.file.path
		}
		if(fs.existsSync(imagen)) {
			const subirCloud = await Cloudinary.subirCloudinary(imagen, req.user._id)
			if(subirCloud.ok) {
				usuario.imagen = subirCloud.info.secure_url
				await usuario.save()
				if(fs.existsSync(imagenOptimizada)) {
					await fs.unlink(req.file.path)
					await fs.unlink(imagen)
				} else {
					await fs.unlink(imagen)
				}
				req.flash('correcto', subirCloud.message)
				return res.redirect('/administracion')
			} else {
				if(fs.existsSync(imagenOptimizada)) {
					await fs.unlink(req.file.path)
					await fs.unlink(imagen)
				} else {
					await fs.unlink(imagen)
				}
				req.flash('error', subirCloud.message)
				return res.redirect('/administracion')
			}
		} else {
			req.flash('error', 'Ha ocurrido un error con la imagen')
			return res.redirect('/administracion')
		}
	}
	req.flash('correcto', 'Decidiste conservar tu imagen actual')
	return res.redirect('/administracion')
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * elegir una imagen de la galeria del usuario y 
 * actualizarla como imagen de perfil en MongoDB
*/
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


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * eliminar una imagen de la galeria del usuario tanto de MongoDB
 * como de Cloudinary
*/
exports.eliminarImagen = async (req, res) => {
	const imagen = await Imagen.findOne({
		public_id: req.params.publicid
	})
	const eliminarCloud = await Cloudinary.eliminarCloudinary(imagen._id)
	if(eliminarCloud.ok) {
		res.status(200).send(eliminarCloud.message)
	} else {
		res.send(eliminarCloud.message)
	}
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 *
 * mostrar formulario para subir imagen de perfil
*/
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


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * renderizar el formulario para crear una cuenta nueva
*/
exports.formCrearCuenta = (req, res) => {
	res.render('crear-cuenta', {
		nombrePagina: 'Crear cuenta en devJobs',
		tagline: 'Comienza a publicar tus vacantes'
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de 
 * error
 * 
 * validar los datos del registro del usuario
*/
exports.validarRegistro = async (req, res, next) => {
	//sanitizar los campos
    const campos = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('La contraseña es obligatoria').escape(),
        body('confirmar').not().isEmpty().withMessage('Debes confirmar la contraseña').escape(),
        body('confirmar').equals(req.body.password).withMessage('Las contraseñas no coinciden')
    ]
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
	//si hay 'errores' | si 'errores' NO esta vacio
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))
        res.render('crear-cuenta', {
            nombrePagina: 'Crear cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes',
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
 * crear nuevo usuario y guardarlo en la base de datos
*/
exports.crearUsuario = async (req, res) => {
	const usuario = new Usuarios(req.body)
	try {
		await usuario.save()
		req.flash('correcto', 'Cuenta creada. Ingresa y ve las vacantes')
		res.redirect('/iniciar-sesion')
	} catch(e) {
		console.log(e)
		req.flash('error', 'No se ha podido crear la cuenta')
		res.redirect('/crear-cuenta')
	}
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * mostrar formulario de iniciar sesion
*/
exports.formIniciarSesion = (req, res) => {
	res.render('iniciar-sesion', {
		nombrePagina: 'Iniciar sesión'
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * mostrar formulario para editar el perfil
*/
exports.formEditarPerfil = (req, res) => {
	res.render('editar-perfil', {
		nombrePagina: 'Editar perfil',
		usuario: req.user,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen
	})
}


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * 
 * guardar los cambios hechos en el perfil
*/
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


/**
 * @param req contiene datos del usuario y su peticion
 * @param res respuesta que devuelve el servidor
 * @param next continua con el siguiente middleware en caso de
 * error
 *
 * sanitizar y validar el formulario de editar perfil
*/
exports.validarPerfil = async (req, res, next) => {
	//sanitizar los campos
    const campos = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
    ]
    if(req.body.password) {
    	campos.push(body('password').escape())
    }
	await Promise.all(campos.map(campo => campo.run(req)))
	const errores = validationResult(req)
	//si hay 'errores' | si 'errores' NO esta vacio
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))
        res.render('editar-perfil', {
			nombrePagina: 'Editar perfil',
			usuario: req.user,
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


