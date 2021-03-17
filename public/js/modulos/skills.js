/**
 * Modulo para manejar las habilidades
 * 
 * @module modulos/skills
*/

document.addEventListener('DOMContentLoaded', function() {
	const listaSkills = document.querySelector('.lista-conocimientos')
	if(listaSkills) {
		const inputHiddenSkills = document.querySelector('#skills')
		const skills = new Set()
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
			const skillsArray = [...skills]
			inputHiddenSkills.value = skillsArray
		})
		const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
		seleccionadas.forEach(seleccionada => {
			skills.add(seleccionada.textContent)
		})
		const skillsArray = [...skills]
		inputHiddenSkills.value = skillsArray
	}
})
