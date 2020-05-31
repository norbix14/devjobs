import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	let swiperContainer = document.querySelector('.swiper-container')
	if(swiperContainer) {
		showSwiper()
		focusProfile()
		document.addEventListener('dblclick', accionesConLaImagen)
	}

	// pequeña ventana modal con mensaje para el usuario
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

	// mostrar carrusel de imagenes de perfil con swiper
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

	// resaltar la imagen de perfil actual y que coincide con la de la galeria
	function focusProfile() {
		let perfil = document.querySelector('.admin-perfil')
		let imagenes = Array.from(document.querySelectorAll('.swiper-slide'))
		for(let imagen of imagenes) {
			if(imagen.src === perfil.src) {
				imagen.classList.add('perfil-actual')
			}
		}
	}

	// elegir lo que se quiere hacer con la imagen
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
						if (!value) {
						  return 'Elegí una opción!'
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
		// usar imagen para actualizar perfil o borrar
		function usarImagenPara(ruta, publicid, redirigir) {
			let loaderContainer = document.querySelector('.loader-container')
			loaderContainer.classList.remove('d-none')
			let url = `${location.origin}/${ruta}/${publicid}`
			axios.post(url, { params: { url } })
			.then(respuesta => {
				if(respuesta.status === 200) {
					loaderContainer.classList.add('d-none')
					ToastFire('success', respuesta.data)
					setTimeout(() => {
						location.href = `${location.origin}/${redirigir}`
					}, 3000)
				} else {
					ToastFire('error', respuesta.data)
				}
			})
			.catch(e => {
				ToastFire('error', 'Ha ocurrido un error')
			})
		}
	}
})
