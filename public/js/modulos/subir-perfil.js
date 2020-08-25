import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { Toast } from '../helpers/toast'

document.addEventListener('DOMContentLoaded', function() {
	const formSubirPerfil = document.querySelector('#subir-imagen-perfil')

	if(formSubirPerfil) {
		const loaderContainer = document.querySelector('.loader-container')
		const perfilActual = document.querySelector('#perfil-actual')

		const imgUploader = document.querySelector('#img-uploader')
		const imgUploadbar = document.querySelector('#img-upload-bar')

		const btnCargarImagen = document.querySelector('#cargar-imagen')
		const btnSubirImagen = document.querySelector('#subir-imagen')
		const btnCancelarImagen = document.querySelector('#cancelar-imagen')
    	
    let infoImagen = {}
		
		imgUploader.addEventListener('change', function(e) {
		  const file = e.target.files[0]

	    if(file) {
	    	if((file.type === 'image/jpeg' || file.type === 'image/png') && 
	    			file.size <= 512000) {
	    		const time_stamp = new Date().getTime()
	    		const public_id = uuid()

	    		const file_info = `public_id=${public_id}&timestamp=${time_stamp}`

					const urlCloudCred = `${location.origin}/cloud-cred/${file_info}`

					axios.post(urlCloudCred)
					.then(response => {
						if(response.status === 200) {
							const { data: { url, key, signature } } = response

		        	const formData = new FormData()
			        formData.append('timestamp', time_stamp)
			        formData.append('public_id', public_id)
			        formData.append('api_key', key)
			        formData.append('file', file)
			        formData.append('signature', signature)

			        btnCargarImagen.addEventListener('click', function() {
				    		imgUploadbar.classList.remove('d-none')
								return cargarEnCloudinary(url, formData)
							})

							btnSubirImagen.addEventListener('click', function() {
								return subirImagen('subir-imagen-perfil', infoImagen.data)
							})

				    	btnCancelarImagen.addEventListener('click', function() {
				    		return borrarImagenCloudinary('eliminar-cloudinary', infoImagen.data.public_id)
				    	})
						}
					})
					.catch(err => {
						Toast('warning', 'Ha ocurrido un error')
					})
	    	} else {
	    		Toast('warning', 'Formato no válido o tamaño de imagen mayor a 500kb')
	    		return
	    	}
	    }
		})

		function cargarEnCloudinary(url, data) {
	    axios.post(url,
	      data,
	      {
	    		headers: {
	        	'Content-Type': 'multipart/form-data'
	        },
          onUploadProgress(e) {
            let progress = Math.round((e.loaded * 100.0) / e.total)
            imgUploadbar.setAttribute('value', progress)
          }
	      }
	    )
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
					
					Toast('success', 'Imagen cargada')
				}
			})
			.catch(err => {
				Toast('error', 'Ha ocurrido un error al cargar la imagen')
			})
		}

		function subirImagen(ruta, data) {
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}`
			axios.post(url, data)
			.then(response => {
				if(response.status === 200) {
					loaderContainer.classList.add('d-none')
					Toast('success', 'Imagen guardada')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
			.catch(err => {
				loaderContainer.classList.add('d-none')
				Toast('error', 'Ha ocurrido un error al guardar la imagen')
			})
		}

		function borrarImagenCloudinary(ruta, publicid) {
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}/${publicid}`
			axios.post(url, { params: { url } })
			.then(response => {
				if(response.status === 200) {
					loaderContainer.classList.add('d-none')
					Toast('success', 'Has decidido no guardar esta imagen')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
			.catch(err => {
				loaderContainer.classList.add('d-none')
				Toast('error', 'Ha ocurrido un error al cancelar')
			})
		}

	}
})
