/**
 * Modulo que retorna un mensaje
 * 
 * @module helpers/res-response
*/

/**
 * Funcion que envia un objeto con datos de la respuesta
 * 
 * @param {boolean} ok - true or false depending of status
 * @param {string} message - message to show
 * @returns {object} object with `ok` and `message` keys
*/
const resResponse = (ok = false, message = 'error') => {
	return { ok, message }
}

module.exports = resResponse
