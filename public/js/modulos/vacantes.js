import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	let vacantesListado = document.querySelector('.panel-administracion')
	if(vacantesListado) {
		vacantesListado.addEventListener('click', accionesListado)
	}

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
	
	// eliminar vacante
	function accionesListado(e) {
		e.preventDefault()
		const vacanteId = e.target.dataset.eliminar
		if(vacanteId) {
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
				if(resultado.value) {
					const url = `${location.origin}/vacantes/eliminar/${vacanteId}`
					axios.delete(url, { params: { url } })
					.then(response => {
						if(response.status === 200) {
							ToastFire('success', response.data)
							// eliminar del DOM
							e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
						} else {
							ToastFire('warning', 'Ha ocurrido un error al eliminar la vacante')
						}
					})
					.catch(err => {
						ToastFire('error', 'Ha ocurrido un error al eliminar la vacante')
					})
				}
			})
		} else if (e.target.tagName === 'A') {
			window.location.href = e.target.href
		}
	}
})
