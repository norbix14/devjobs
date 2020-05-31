import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/nbxfab/image/upload'
	const CLOUDINARY_UPLOAD_PRESET = 'n3spgsbe'
	const formSubirPerfil = document.querySelector('#subir-imagen-perfil')
	
	if(formSubirPerfil) {
		let ToastFire = (icon = 'success', title = 'Acción realizada') => {
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
		const loaderContainer = document.querySelector('.loader-container')
		const perfilActual = document.querySelector('#perfil-actual')

		const imgUploader = document.querySelector('#img-uploader')
		const imgUploadbar = document.querySelector('#img-upload-bar')

		const btnCargarImagen = document.querySelector('#cargar-imagen')
		const btnSubirImagen = document.querySelector('#subir-imagen')
		const btnCancelarImagen = document.querySelector('#cancelar-imagen')
    	
    	let infoImagen = ''
		
		// detectar cuando se suba un archivo
		imgUploader.addEventListener('change', function(e) {
		    const file = e.target.files[0]
		    if(file) {
		    	if((file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 512000) {
		        	const formData = new FormData()
			        formData.append('file', file)
			        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

			        btnCargarImagen.addEventListener('click', function() {
				    	imgUploadbar.classList.remove('d-none')
						return cargarEnCloudinary(CLOUDINARY_URL, formData)
					})

					btnSubirImagen.addEventListener('click', function() {
						return subirImagen('subir-imagen-perfil', infoImagen.data)
					})

			    	btnCancelarImagen.addEventListener('click', function() {
			    		return borrarImagenCloudinary('eliminar-cloudinary', infoImagen.data.public_id)
			    	})
		    	} else {
		    		ToastFire('error', 'Formato no válido o tamaño de imagen mayor a 500kb')
		    		return
		    	}

		    }
		})

		// cargar imagen en Cloudinary
		function cargarEnCloudinary(url, data) {
		    axios.post(url, data, { 
		    	headers: {
		        	'Content-Type': 'multipart/form-data'
		        },
	            onUploadProgress(e) {
	                let progress = Math.round((e.loaded * 100.0) / e.total)
	                imgUploadbar.setAttribute('value', progress)
	            }
	        })
		    .then(response => {
		    	if(response.status === 200) {
		    		infoImagen = response
		    		btnCargarImagen.innerText = 'Cargada'
		    		btnCargarImagen.setAttribute('disabled', '')
		    		imgUploadbar.setAttribute('title', 'Imagen cargada')
		    		btnSubirImagen.classList.remove('d-none')
		    		btnCancelarImagen.classList.remove('d-none')
		    		perfilActual.src = response.data.secure_url
		    		ToastFire('success', 'Imagen cargada')
		    	} else {
		    		ToastFire('error', 'Error de estado')
		    	}
		    })
		    .catch(err => {
		    	console.log(err)
		    	ToastFire('error', 'Ha ocurrido un error al cargar la imagen')
		    })
		}

		// guardar imagen en mongodb
		function subirImagen(ruta, data) {
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}`
			axios.post(url, data)
			.then(response => {
				if(response.status === 200) {
					loaderContainer.classList.add('d-none')
					ToastFire('success', 'Imagen guardada')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				} else {
					loaderContainer.classList.add('d-none')
					ToastFire('error', 'No se ha podido subir la imagen')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
			.catch(err => {
				console.log(err)
				ToastFire('error', 'Ha ocurrido un error al subir la imagen')
			})
		}

		// borrar imagen de cloudinary
		function borrarImagenCloudinary(ruta, publicid) {
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}/${publicid}`
			axios.post(url, { params: { url } })
			.then(response => {
				if(response.status === 200) {
					loaderContainer.classList.add('d-none')
					ToastFire('success', 'Operación cancelada')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				} else {
					loaderContainer.classList.add('d-none')
					ToastFire('error', 'Ha ocurrido un error')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
			.catch(err => {
				console.log(err)
				ToastFire('error', 'Ha ocurrido un error')
			})
		}
	}
})
