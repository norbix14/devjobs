const bcrypt = require('bcryptjs')

/**
 * Modulo para el manejo de la contraseña, tanto
 * su encriptacion como verificacion
 * 
 * @module helpers/passwordHandler
*/

/**
 * Funcion para encriptar contraseña
 * 
 * @param {string} string - string to hash
 * @returns {string} la contraseña encriptada
*/
exports.encryptPassword = (string) => {
  const salt = bcrypt.genSaltSync()
  const hashed = bcrypt.hashSync(string, salt)
  return hashed
}

/**
 * Funcion para comparar contraseña
 * 
 * @param {string} string - string to compare
 * @param {string} hash - hash to test against
 * @returns {boolean} true or false
*/
exports.comparePassword = (string, hash) => {
  const result = bcrypt.compareSync(string, hash)
  return result
}
