const emailConfig = require('../config/email')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const util = require('util')


let transport = nodemailer.createTransport({
	host: emailConfig.host,
	port: emailConfig.port,
	auth: {
		user: emailConfig.user,
		pass: emailConfig.pass
	}
})

// utilizar templates de handlebars
const hbsOptions = {
	viewEngine: {
		extName: '.handlebars',
		partialsDir: __dirname + '/../views/emails',
		layoutsDir: __dirname + '/../views/emails',
		defaultLayout: 'reset.handlebars'
	},
	viewPath: __dirname + '/../views/emails',
	extName: '.handlebars'
}
transport.use('compile', hbs(hbsOptions))


/**
 * @param opciones objeto con datos para el email
*/
exports.enviar = async opciones => {
	const resultado = {}
	try {
		const opcionesEmail = {
			from: 'devJobs <no-reply@devjobs.com>',
			to: opciones.usuario.email,
			subject: opciones.subject,
			template: opciones.archivo,
			context: {
				resetUrl: opciones.resetUrl
			}
		}
		const enviarEmail = util.promisify(transport.sendMail, transport)
		await enviarEmail.call(transport, opcionesEmail)
		resultado.ok = true
		resultado.message = 'Se te envió un email con los pasos a seguir. Revisalo!'
	} catch(e) {
		// console.log('Error al enviar email')
		// console.log(e)
		resultado.ok = false
		resultado.message = 'Ha ocurrido un error al enviar el email'
	}
}


