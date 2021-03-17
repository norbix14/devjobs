import { AxiosRequest } from '../helpers/AxiosRequest'
import {
	SwalDelete,
	Toast
} from '../helpers/SweetAlert'

/**
 * Modulo para manejar las acciones con las vacantes
 * 
 * @module modulos/vacantes
*/

document.addEventListener('DOMContentLoaded', function() {
	const vacantesListado = document.querySelector('.panel-administracion')
	if(vacantesListado) {
		vacantesListado.addEventListener('click', accionesListado)
	}

	/**
	 * Funcion para realizar acciones con las vacantes
	 * 
	 * @param {object} e - Mouse event
	*/
	function accionesListado(e) {
		e.preventDefault()
		const { eliminar: vacanteId = null } = e.target.dataset
		if(vacanteId) {
			SwalDelete(() => {
				const url = `${location.origin}/vacantes/eliminar/${vacanteId}`
				const options = {
					url,
					method: 'DELETE',
					params: { url }
				}
				AxiosRequest(options, (err, res) => {
					if (err) {
						return Toast('error', res.message)
					}
					if (res.status === 200) {
						e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
						return Toast('success', res.data)
					}
				})
			})
		} else if (e.target.tagName === 'A') {
			window.location.href = e.target.href
		}
	}
})
