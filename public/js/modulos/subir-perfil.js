// import axios from 'axios'
// import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	const formSubirPerfil = document.querySelector('#subir-imagen-perfil')
	if(formSubirPerfil) {
		formSubirPerfil.addEventListener('submit', function() {
			// mostrar loader al usuario
			let loaderContainer = document.querySelector('.loader-container')
			if(loaderContainer) {
				loaderContainer.classList.remove('d-none')
			}
		})
	}
})
