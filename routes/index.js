const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')

module.exports = () => {
	/* Inicio */
	// mostrar todas las vacantes
	router.get('/',
		homeController.mostrarTrabajos
	)

	/* Vacantes */
	// crear vacante
	router.get('/vacantes/nueva',
		authController.verificarUsuario,
		vacantesController.formularioNuevaVacante
	)

	router.post('/vacantes/nueva',
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.agregarVacante
	)

	// mostrar vacante
	router.get('/vacantes/:url',
		vacantesController.mostrarVacante
	)

	// recibir datos del candidato
	router.post('/vacantes/:url',
		// vacantesController.subirCv,
		vacantesController.contactar
	)

	// editar vacante
	router.get('/vacantes/editar/:url',
		authController.verificarUsuario,
		vacantesController.formEditarVacante
	)

	router.post('/vacantes/editar/:url',
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.editarVacante
	)

	// eliminar vacante
	router.delete('/vacantes/eliminar/:id',
		vacantesController.eliminarVacante
	)

	/* Cuentas */
	// crear cuentas
	router.get('/crear-cuenta',
		usuariosController.formCrearCuenta
	)

	router.post('/crear-cuenta',
		usuariosController.validarRegistro,
		usuariosController.crearUsuario
	)

	// iniciar sesion
	router.get('/iniciar-sesion',
		usuariosController.formIniciarSesion
	)

	router.post('/iniciar-sesion',
		authController.autenticarUsuario
	)

	// cerrar sesion
	router.get('/cerrar-sesion',
		authController.verificarUsuario,
		authController.cerrarSesion
	)

	/*
	// reestablecer contraseña
	router.get('/reestablecer-password',
		authController.formReestablecerPassword
	)

	router.post('/reestablecer-password',
		authController.enviarToken
	)

	// almacenar contraseña nueva en la base de datos
	router.get('/reestablecer-password/:token',
		authController.reestablecerPassword
	)

	router.post('/reestablecer-password/:token',
		authController.guardarPassword
	)
	*/

	/* Candidatos */
	// mostrar candidatos por vacante
	router.get('/candidatos/:id',
		authController.verificarUsuario,
		vacantesController.mostrarCandidatos
	)

	/* Administracion */
	// admin
	router.get('/administracion',
		authController.verificarUsuario,
		authController.mostrarPanel
	)

	// editar perfil
	router.get('/editar-perfil',
		authController.verificarUsuario,
		usuariosController.formEditarPerfil
	)

	router.post('/editar-perfil',
		authController.verificarUsuario,
		usuariosController.validarPerfil,
		usuariosController.editarPerfil
	)

	// obtener credenciales de Cloudinary
	router.post('/cloud-cred/:fileinfo',
		authController.verificarUsuario,
		usuariosController.obtenerCloudCred
	)
	
	// subir imagen de perfil por separado
	router.get('/subir-imagen-perfil',
		authController.verificarUsuario,
		usuariosController.formSubirImagen
	)
	
	router.post('/subir-imagen-perfil',
		authController.verificarUsuario,
		// usuariosController.subirImagen,
		// usuariosController.optimizarImagen,
		// usuariosController.guardarImagenPerfil,
		usuariosController.guardarImagenPerfilCliente
	)

	// cambiar o elegir nueva imagen de perfil
	router.post('/cambiar-imagen-perfil/:publicid',
		authController.verificarUsuario,
		usuariosController.cambiarImagenPerfil
	)

	// eliminar una imagen de Mongo y Cloudinary
	router.post('/eliminar-imagen/:publicid',
		authController.verificarUsuario,
		usuariosController.eliminarImagen
	)

	// eliminar una imagen solo de Cloudinary
	router.post('/eliminar-cloudinary/:publicid',
		authController.verificarUsuario,
		usuariosController.eliminarCloudinary
	)

	/* Buscador */
	// buscador de vacantes
	router.post('/buscador',
		vacantesController.buscarVacantes
	)

	return router
}
