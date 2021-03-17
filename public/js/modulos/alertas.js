/**
 * Modulo para manejar las alertas
 * 
 * @module modulos/alertas
*/

document.addEventListener('DOMContentLoaded', function() {
	const alertas = document.querySelector('.alertas')
	if(alertas) {
		const interval = setInterval(() => {
			if(alertas.children.length > 0) {
				alertas.removeChild(alertas.children[0])
			} else if (alertas.children.length === 0) {
				alertas.parentElement.removeChild(alertas)
				clearInterval(interval)
			}
		}, 3000)
	}
})
