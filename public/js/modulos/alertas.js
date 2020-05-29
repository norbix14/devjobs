import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	let alertas = document.querySelector('.alertas')
	if(alertas) {
		// limpiar alertas de la pantalla del lado del cliente
		let alertas = document.querySelector('.alertas')
		let interval = setInterval(() => {
			if(alertas.children.length > 0) {
				alertas.removeChild(alertas.children[0])
			} else if (alertas.children.length === 0) {
				alertas.parentElement.removeChild(alertas)
				clearInterval(interval)
			}
		}, 3000)
	}
})
