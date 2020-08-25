require('dotenv').config({ path: 'variables.env' })
const cloudinary = require('cloudinary').v2
const Imagen = require('../models/Imagen')
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.subirCloudinary = async (image, owner) => {
  const resultado = {}
  try {
    const { secure_url, 
            public_id, 
            created_at } = await cloudinary.uploader.upload(image)
    const nuevaImagen = new Imagen({
      secure_url,
      public_id,
      created_at,
      owner
    })
    await nuevaImagen.save()
    resultado.ok = true
    resultado.message = 'La imagen se subió correctamente'
  } catch (e) {
    resultado.ok = false
    resultado.message = 'Ha ocurrido un error al subir la imagen'
  }
  return resultado
}

exports.eliminarImagen = async id => {
  const resultado = {}
  try {
  	const { public_id } = await Imagen.findByIdAndRemove(id)
  	await cloudinary.uploader.destroy(public_id)
    resultado.ok = true
    resultado.message = 'La imagen se borró correctamente'
  } catch(e) {
    resultado.ok = false
    resultado.message = 'Ha ocurrido un error al eliminar la imagen'
  }
	return resultado
}

exports.eliminarCloudinary = async publicid => {
  const resultado = {}
  try {
    await cloudinary.uploader.destroy(publicid)
    resultado.ok = true
    resultado.message = 'La imagen se borró correctamente'
  } catch(e) {
    resultado.ok = false
    resultado.message = 'Ha ocurrido un error al eliminar la imagen'
  }
  return resultado
}
