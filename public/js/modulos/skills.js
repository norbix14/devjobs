document.addEventListener('DOMContentLoaded', function() {
	let listaSkills = document.querySelector('.lista-conocimientos')
	if(listaSkills) {
		let inputHiddenSkills = document.querySelector('#skills')
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
			let skillsArray = [...skills]
			inputHiddenSkills.value = skillsArray
		})
		let seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
		seleccionadas.forEach(seleccionada => {
			skills.add(seleccionada.textContent)
		})
		let skillsArray = [...skills]
		inputHiddenSkills.value = skillsArray
	}
})
