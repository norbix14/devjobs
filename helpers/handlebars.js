/**
 * Helpers del lado del cliente
*/
module.exports = {
	/**
	 * @param seleccionadas es un array que tendra datos traidos de la base de datos
	 * @param opciones son los elementos que hay en el html dentro de este helper
	 * @return retorna las habilidades seleccionadas
	*/
	seleccionarSkills: (seleccionadas = [], opciones) => {
		const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 
						'JavaScript', 'jQuery', 'Node', 'Angular', 
						'VueJS', 'ReactJS', 'React Hooks', 'Redux', 
						'Apollo', 'GraphQL', 'TypeScript', 'PHP', 
						'Laravel', 'Symfony', 'Python', 'Django', 
						'ORM', 'Sequelize', 'Mongoose', 'SQL', 
						'MVC', 'SASS', 'WordPress']
		let html = ''
		skills.forEach(skill => {
			html += `<li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>`
		})
		return opciones.fn().html = html
	},

	/**
	 * @param seleccionado dato que puede ser traido desde la base de datos
	 * @param opciones son los elementos que hay en el html dentro de este helper
	 * @return retorna el tipo de contrato almacenado en BBDD
	*/
	tipoContrato: (seleccionado, opciones) => {
		return opciones.fn(this).replace(new RegExp(` value="${seleccionado}"`), '$& selected')
	},

	/**
	 * @param errores objeto con los errores producidos por la validacion
	 * @param alertas html dentro del bloque de este helper
	 * @return retorna los errores
	*/
	mostrarAlertas: (errores = {}, alertas) => {
		const categoria = Object.keys(errores)
		let html = ''
		if(categoria.length) {
			errores[categoria].forEach(error => {
				html += `<div class="alerta ${categoria}">${error}</div>`
			})
		}
		return alertas.fn().html = html
	}
}
