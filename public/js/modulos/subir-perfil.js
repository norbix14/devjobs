import axios from 'axios'
import Swal from 'sweetalert2'
import { v4 as uuid } from 'uuid'

document.addEventListener('DOMContentLoaded', function() {
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
		    		const time_stamp = new Date().getTime()
		    		const public_id = uuid()

		    		const file_info = `public_id=${public_id}&timestamp=${time_stamp}`

					const urlCloudCred = `${location.origin}/cloud-cred/${file_info}`
					axios.post(urlCloudCred)
					.then(response => {
						if(response.status === 200) {
							const CLOUDINARY_URL = response.data.url
							const CLOUDINARY_API_KEY = response.data.key
							const CLOUDINARY_SIGNATURE = response.data.signature

				        	const formData = new FormData()
					        formData.append('timestamp', time_stamp)
					        formData.append('public_id', public_id)
					        formData.append('api_key', CLOUDINARY_API_KEY)
					        formData.append('file', file)
					        formData.append('signature', CLOUDINARY_SIGNATURE)

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
							ToastFire('warning', 'Ha ocurrido un error')
						}
					})
					.catch(err => {
						ToastFire('warning', 'Ha ocurrido un error')
					})
		    	} else {
		    		ToastFire('warning', 'Formato no válido o tamaño de imagen mayor a 500kb')
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
		    		perfilActual.title = 'Imagen cargada. Presiona SUBIR para guardarla'
		    		
		    		ToastFire('success', 'Imagen cargada')
		    	} else {
		    		ToastFire('warning', 'Ha ocurrido un error al cargar la imagen')
		    	}
		    })
		    .catch(err => {
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
					ToastFire('warning', 'Ha ocurrido un error al guardar la imagen')
				}
			})
			.catch(err => {
				ToastFire('error', 'Ha ocurrido un error al guardar la imagen')
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
					ToastFire('success', 'Has decidido no guardar esta imagen')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				} else {
					loaderContainer.classList.add('d-none')
					ToastFire('warning', 'Ha ocurrido un error al cancelar')
				}
			})
			.catch(err => {
				ToastFire('error', 'Ha ocurrido un error al cancelar')
			})
		}
	}
})
