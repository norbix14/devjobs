import Swal from 'sweetalert2'

export const Toast = (icon = 'success', title = 'Acción realizada') => {
	const ToastAlert = Swal.mixin({
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
	return ToastAlert.fire({ icon, title })
}
