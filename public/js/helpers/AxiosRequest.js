import axios from 'axios'

/**
 * Modulo para manejar las peticiones HTTP 
 * mediante AXIOS
 * 
 * @module helpers/AxiosRequest
*/

/**
 * Funcion para realizar las peticiones HTTP
 * 
 * @param {object} options - custom options
 * @param {string} options.url - endpoint
 * @param {string} options.method - HTTP method
 * @param {object} options.params - URL parameters to sent with the request
 * @param {string | object} options.data - data to be sent as the request body
 * @param {object} options.headers - aditional headers to be sent with the request
 * 
 * @param {function} callback - callback function
 * 
 * @example
 * const options = {
 *  url: 'https://miweb.com/api',
 *  method: 'POST',
 *  params: { ID: '1234567890' },
 *  data: {},
 *  headers: { 'x-token': 'abod8nD7Vnd87N' }
 * }
 * AxiosRequest(options, (err, res) => {
 *  if(err) {
 *    return console.log('handle error here')
 *  }
 *  if(res.status === 200) {
 *    return console.log('handle success here')
 *  }
 * })
*/
export const AxiosRequest = (options, callback) => {
  const {
    url = '',
    method = '',
    params = {},
    data = {},
    headers = {},
    ...rest
  } = options
  axios({
    ...rest,
    url,
    method,
    params,
    data,
    headers,
    timeout: 10000
  })
  .then((res) => {
    return callback(null, res)
  })
  .catch((err) => {
    return callback(err, {
      message: 'Ha ocurrido un error'
    })
  })
}
