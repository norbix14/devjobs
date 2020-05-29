const cloudinary = require('cloudinary').v2
const Imagen = require('../models/Imagen')
require('dotenv').config({ path: 'variables.env' })
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


/**
 * @param image es la ruta de la imagen que sera subida a la nube de Cloudinary
 * @param owner es el _id del dueño de la foto
 * @return retorna un objeto con las claves de: 
 * 'ok': 'boolean', 'message': 'string' e 'info': 'object'.
 * son datos con informacion del resultado de la operacion, un mensaje para el
 * cliente e informacion de la imagen subida o el error producido en caso de alguno.
 *
 * subir la imagen a Cloudinary
*/
exports.subirCloudinary = async (image, owner) => {
    const resultado = {}
    try {
        const imagenSubida = await cloudinary.uploader.upload(image)
        const nuevaImagen = new Imagen({
            secure_url: imagenSubida.secure_url,
            public_id: imagenSubida.public_id,
            created_at: imagenSubida.created_at,
            owner
        })
        await nuevaImagen.save()
        resultado.ok = true
        resultado.message = 'La imagen se subió correctamente'
        resultado.info = imagenSubida
    } catch (e) {
        // console.log('>> Ha ocurrido un error al subir a Cloudinary <<')
        // console.log(e)
        resultado.ok = false
        resultado.message = 'Ha ocurrido un error al subir la imagen'
        resultado.info = e
    }
    return resultado
}

/**
 * @param id es la _id del dueño de la foto. con el se identificara a la foto
 * que se quiere eliminar tanto de MongoDB como de Cloudinary
 * @return retorna un objeto con las claves de: 
 * 'ok': 'boolean', 'message': 'string' e 'info': 'object'.
 * son datos con informacion del resultado de la operacion, un mensaje para el
 * cliente e informacion de la imagen eliminada o el error producido en caso de alguno.
 *
 * borrar la imagen de MongoDb y de la nube de Cloudinary
*/
exports.eliminarCloudinary = async id => {
    const resultado = {}
    try {
    	const imagenPerfil = await Imagen.findByIdAndRemove(id)
    	const imagenBorrada = await cloudinary.uploader.destroy(imagenPerfil.public_id)
        resultado.ok = true
        resultado.message = 'La imagen se borró correctamente'
        resultado.info = imagenBorrada || {}
    } catch(e) {
        // console.log('>> Ha ocurrido un error al eliminar de Cloudinary <<')
        // console.log(e)
        resultado.ok = false
        resultado.message = 'Ha ocurrido un error al eliminar la imagen'
        resultado.info = e
    }
	return resultado
}

