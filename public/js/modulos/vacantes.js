import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	let vacantesListado = document.querySelector('.panel-administracion')
	if(vacantesListado) {
		vacantesListado.addEventListener('click', accionesListado)
	}
	// eliminar vacante
	function accionesListado(e) {
		e.preventDefault()
		// reusar Toast
		const ToastFire = (icon = 'success', title = 'Acción realizada') => {
			const Toast = Swal.mixin({
				toast: true,
				position: 'top-end',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				onOpen: (toast) => {
					toast.addEventListener('mouseenter', Swal.stopTimer)
					toast.addEventListener('mouseleave', Swal.resumeTimer)
				}
			})
			Toast.fire({ icon, title })
		}
		// click en boton de eliminar
		if(e.target.dataset.eliminar) {
			Swal.fire({
				title: '¿Estás seguro?',
				text: 'Esto no se puede revertir',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Si, borrar',
				cancelButtonText: 'No, cancelar'
			})
			.then(resultado => {
				if (resultado.value) {
					const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`
					axios.delete(url, { params: { url } })
					.then(respuesta => {
						if(respuesta.status === 200) {
							ToastFire('success', respuesta.data)
							// eliminar del DOM
							e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
						}
					})
					.catch(e => {
						ToastFire('error', 'Ha ocurrido un error')
					})
				}
			})
		} else if (e.target.tagName === 'A') {
			window.location.href = e.target.href
		}
	}
})
