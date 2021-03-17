import Swal from 'sweetalert2'

/**
 * Modulo para manejar las alertas de SweetAlert
 * 
 * @module helpers/SweetAlert
*/

/**
 * Funcion para mostrar una pequeña alerta modal
 * 
 * @param {string} icon - alert icon
 * @param {string} title - message
 * 
 * @example
 * Toast('success', 'Everything is fine')
*/
export const Toast = (icon = 'success', title = 'Correcto') => {
  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  return toast.fire({ icon, title })
}

/**
 * Funcion para elegir una accion a realizar con una imagen
 * 
 * @param {object} options - options to choose
 * @param {function} callback - callback function wich
 * return the value of the action as a parameter
 * 
 * @example
 * const options = {
 *  'perfil': 'Perfil',
 *  'borrar': 'Borrar'
 * }
 * SwalChoose(options, (value) => {
 *  switch(value) {
 *    case 'perfil':
 *      console.log('hacer algo')
 *      break
 *    case 'borrar':
 *      console.log('hacer otra cosa')
 *      break
 *  }
 * })
*/
export const SwalChoose = (options, callback) => {
  Swal.fire({
    title: '¿Qué quieres hacer con la imagen?',
    input: 'radio',
    inputOptions: options,
    inputValidator: (value) => {
      if (!value) {
        return '¡Elige una opción!'
      }
    }
  })
  .then((res) => {
    if(res.isConfirmed) {
      return callback(res.value)
    }
  })
}

/**
 * Funcion para preguntar por la eliminacion
 * 
 * @param {function} callback - callback funtion
 * 
 * @example
 * SwalDelete(() => {
 *  console.log('do something if action is confirmed')
 * })
*/
export const SwalDelete = (callback) => {
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
  .then((res) => {
    if (res.isConfirmed) {
      return callback()
    }
  })
}
