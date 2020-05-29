require('dotenv').config({ path: 'variables.env' })

/**
 * Configuracion para el envio de emails con Mailtrap
*/
module.exports = {
	user: process.env.MAIL_USER,
	pass: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT
}
