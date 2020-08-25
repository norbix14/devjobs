const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const util = require('util')
const path = require('path')
const emailConfig = require('../config/email')

const { host, port, user, pass } = emailConfig

const transport = nodemailer.createTransport({
	host,
	port,
	auth: {
		user,
		pass
	}
})

const viewEmailPath = path.join(__dirname, '/../views/emails')

const hbsOptions = {
	viewEngine: {
		extName: '.handlebars',
		partialsDir: viewEmailPath,
		layoutsDir: viewEmailPath,
		defaultLayout: 'reset.handlebars'
	},
	viewPath: viewEmailPath,
	extName: '.handlebars'
}

transport.use('compile', hbs(hbsOptions))

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
		resultado.ok = false
		resultado.message = 'Ha ocurrido un error al enviar el email'
	}
}
