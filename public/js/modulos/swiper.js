import { AxiosRequest } from '../helpers/AxiosRequest'
import {
	SwalChoose,
	SwalDelete,
	Toast
} from '../helpers/SweetAlert'

/**
 * Modulo para manejar la galeria de imagenes del perfil
 * 
 * @module modulos/swiper
*/

document.addEventListener('DOMContentLoaded', function() {
	const swiperContainer = document.querySelector('.swiper-container')
	if(swiperContainer) {
		showSwiper()
		focusProfile()
		document.addEventListener('dblclick', accionesConLaImagen)
	}

	/**
	 * Funcion para mostrar una galeria con Swiper
	*/
	function showSwiper() {
		const swiper = new Swiper('.swiper-container', {
			effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      coverflowEffect: {
      	rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true
      },
      pagination: {
        el: '.swiper-pagination'
      }
	  })
	}

	/**
	 * Funcion para enfocar la imagen de perfil actual
	*/
	function focusProfile() {
		const perfil = document.querySelector('.admin-perfil')
		const imagenes = Array.from(document.querySelectorAll('.swiper-slide'))
		for(let imagen of imagenes) {
			if(imagen.src === perfil.src) {
				imagen.classList.add('perfil-actual')
			}
		}
	}

	/**
	 * Funcion para realizar acciones con la imagen
	 * 
	 * @param {object} e - Mouse event
	*/
	function accionesConLaImagen(e) {
		if(e.target.tagName === 'IMG') {
			const { publicId = null } = e.target.dataset
			if(publicId) {
				let inputOptions = {
					'perfil': 'Perfil',
					'borrar': 'Borrar',
					'nada': 'Nada'
				}
				SwalChoose(inputOptions, (value) => {
					switch (value) {
						case 'perfil':
							usarImagenPara('cambiar-imagen-perfil', publicId, 'administracion')
							break
						case 'borrar':
							SwalDelete(() => {
								usarImagenPara('eliminar-imagen', publicId, 'administracion')
							})
							break
						case 'nada':
							return
						default:
							return
					}
				})
			}
		}
	}

	/**
	 * Funcion para realizar las peticiones al servidor
	 * 
	 * @param {string} ruta - endpoint
	 * @param {string} publicid - public id of the image
	 * @param {string} redirigir - route to redirect
	*/
	function usarImagenPara(ruta, publicid, redirigir) {
		const loaderContainer = document.querySelector('.loader-container')
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
				Toast('success', res.data)
				setTimeout(() => {
					location.href = `${location.origin}/${redirigir}`
				}, 2900)
			}
		})
	}
})
