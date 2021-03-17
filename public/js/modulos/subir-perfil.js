import { AxiosRequest } from '../helpers/AxiosRequest'
import { nanoid } from 'nanoid'
import { Toast } from '../helpers/SweetAlert'

/**
 * Modulo para manejar la subida de imagenes
 * 
 * @module modulos/subir-perfil
*/

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
	    	if((file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 512000) {
	    		const time_stamp = new Date().getTime()
					const public_id = `DJ-${nanoid()}`
	    		const file_info = `public_id=${public_id}&timestamp=${time_stamp}`
					const urlCloudCred = `${location.origin}/cloud-cred/${file_info}`

					const options = {
						url: urlCloudCred,
						method: 'POST'
					}
					AxiosRequest(options, (err, res) => {
						if (err) {
							return Toast('warning', res.message)
						}
						if (res.status === 200) {
							const { data: { url, key, signature } } = res
							const formData = new FormData()
							formData.append('timestamp', time_stamp)
							formData.append('public_id', public_id)
							formData.append('api_key', key)
							formData.append('file', file)
							formData.append('signature', signature)

							btnCargarImagen.addEventListener('click', function () {
								imgUploadbar.classList.remove('d-none')
								return cargarEnCloudinary(url, formData)
							})

							btnSubirImagen.addEventListener('click', function () {
								return subirImagen('subir-imagen-perfil', infoImagen.data)
							})

							btnCancelarImagen.addEventListener('click', function () {
								return borrarImagenCloudinary('eliminar-cloudinary', infoImagen.data.public_id)
							})
						}
					})
	    	} else {
	    		return Toast('warning', 'Formato no válido o tamaño de imagen mayor a 500kb')
	    	}
	    }
		})

		/**
		 * Funcion para cargar la imagen en Cloudinary
		 * 
		 * @param {string} url - endpoint
		 * @param {object} data - image data
		*/
		function cargarEnCloudinary(url, data) {
			const options = {
				url,
				method: 'POST',
				data,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
			AxiosRequest(options, (err, res) => {
				if (err) {
					return Toast('error', res.message)
				}
				if (res.status === 200) {
					infoImagen = res

					btnCargarImagen.innerText = 'Cargada'
					btnCargarImagen.setAttribute('disabled', '')
					imgUploadbar.setAttribute('value', '100')
					imgUploadbar.setAttribute('title', 'Imagen cargada')

					btnSubirImagen.classList.remove('d-none')
					btnCancelarImagen.classList.remove('d-none')

					perfilActual.src = res.data.secure_url
					perfilActual.title = 'Imagen cargada. Presiona SUBIR para guardarla'

					return Toast('success', 'Imagen cargada')
				}
			})
		}

		/**
		 * Funcion para guardar los datos de la imagen subida
		 * a Cloudinary en la BBDD
		 * 
		 * @param {string} ruta - endpoint
		 * @param {object} data - image data
		*/
		function subirImagen(ruta, data) {
			loaderContainer.classList.remove('d-none')
			const url = `${location.origin}/${ruta}`
			const options = {
				url,
				method: 'POST',
				data
			}
			AxiosRequest(options, (err, res) => {
				if (err) {
					loaderContainer.classList.add('d-none')
					return Toast('error', res.message)
				}
				if (res.status === 200) {
					loaderContainer.classList.add('d-none')
					Toast('success', 'Imagen guardada')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
		}

		/**
		 * Funcion para borrar la imagen subida a Cloudinary
		 * 
		 * @param {string} ruta - endpoint
		 * @param {string} publicid - public id of the image been deleted
		*/
		function borrarImagenCloudinary(ruta, publicid) {
			loaderContainer.classList.remove('d-none')
			const url = `${location.origin}/${ruta}/${publicid}`
			const options = {
				url,
				method: 'POST',
				params: {
					url
				}
			}
			AxiosRequest(options, (err, res) => {
				if (err) {
					loaderContainer.classList.add('d-none')
					return Toast('error', res.message)
				}
				if (res.status === 200) {
					loaderContainer.classList.add('d-none')
					Toast('success', 'Has decidido no guardar esta imagen')
					setTimeout(() => {
						location.href = `${location.origin}/subir-imagen-perfil`
					}, 2900)
				}
			})
		}
	}
})
