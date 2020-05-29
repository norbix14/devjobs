import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', function() {
	let listaSkills = document.querySelector('.lista-conocimientos')
	if(listaSkills) {
		const skills = new Set()
		// agregar habilidades cuando se quiera publicar una vacante
		listaSkills.addEventListener('click', e => {
			if(e.target.tagName === 'LI') {
				if(e.target.classList.contains('activo')) {
					skills.delete(e.target.textContent)
					e.target.classList.remove('activo')
				} else {
					skills.add(e.target.textContent)
					e.target.classList.add('activo')
				}
			}
			// copiar y convertir el Set en un array
			let skillsArray = [...skills]
			// rellenar el 'value' del 'input type hidden' con los valores en el array
			document.querySelector('#skills').value = skillsArray
		})
		// cuando estemos en la seccion de editar
		let seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
		seleccionadas.forEach(seleccionada => {
			skills.add(seleccionada.textContent)
		})
		// inyectar en el 'input type hidden' con los datos viejos y nuevos
		let skillsArray = [...skills]
		document.querySelector('#skills').value = skillsArray
	}
})
