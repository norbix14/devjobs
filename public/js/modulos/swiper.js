import axios from 'axios'
import Swal from 'sweetalert2'
import { Toast } from '../helpers/toast'

document.addEventListener('DOMContentLoaded', function() {
	let swiperContainer = document.querySelector('.swiper-container')
	if(swiperContainer) {
		showSwiper()
		focusProfile()
		document.addEventListener('dblclick', accionesConLaImagen)
	}

	function showSwiper() {
		let swiper = new Swiper('.swiper-container', {
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

	function focusProfile() {
		let perfil = document.querySelector('.admin-perfil')
		let imagenes = Array.from(document.querySelectorAll('.swiper-slide'))
		for(let imagen of imagenes) {
			if(imagen.src === perfil.src) {
				imagen.classList.add('perfil-actual')
			}
		}
	}

	function accionesConLaImagen(e) {
		if(e.target.tagName === 'IMG') {
			let public_id = e.target.dataset.publicId
			if(public_id) {
				let inputOptions = {
					'elegir': 'Perfil',
					'borrar': 'Borrar',
					'nada': 'Nada'
				}
				const { value: action } = Swal.fire({
					title: '¿Qué quieres hacer con la imagen?',
					input: 'radio',
					inputOptions: inputOptions,
					inputValidator: (value) => {
						if(!value) {
						  return '¡Elige una opción!'
						}
					}
				})
				.then(resultado => {
					if(resultado.value) {
						switch (resultado.value) {
							case 'elegir':
								usarImagenPara('cambiar-imagen-perfil', public_id, 'administracion')
								break
							case 'borrar':
								Swal.fire({
									title: '¿Quieres hacerlo?',
									text: 'Esto no se puede revertir',
									icon: 'warning',
									showCancelButton: true,
									confirmButtonColor: '#3085d6',
									cancelButtonColor: '#d33',
									confirmButtonText: 'Si, borrar',
									cancelButtonText: 'No, cancelar'
								})
								.then(res => {
									if(res.value) {
										usarImagenPara('eliminar-imagen', public_id, 'administracion')
									}
								})
								break
							case 'nada':
								// no hacer nada
								break
						}
					}
				})
			}
		}
		function usarImagenPara(ruta, publicid, redirigir) {
			let loaderContainer = document.querySelector('.loader-container')
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}/${publicid}`
			axios.post(url, { params: { url } })
			.then(response => {
				if(response.status === 200) {
					loaderContainer.classList.add('d-none')
					Toast('success', response.data)
					setTimeout(() => {
						location.href = `${location.origin}/${redirigir}`
					}, 2900)
				}
			})
			.catch(err => {
				loaderContainer.classList.add('d-none')
				Toast('error', 'Ha ocurrido un error')
			})
		}
	}
})
