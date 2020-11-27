require('dotenv').config({ path: 'variables.env' })
const cloudinary = require('cloudinary').v2
const Imagen = require('../models/Imagen')
const resResponse = require('../helpers/res-response')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.subirCloudinary = async (image, owner) => {
  try {
    const { 
      secure_url, 
      public_id, 
      created_at
    } = await cloudinary.uploader.upload(image)
    const nuevaImagen = new Imagen({
      secure_url,
      public_id,
      created_at,
      owner
    })
    await nuevaImagen.save()
    return resResponse(true, 'La imagen se subió correctamente')
  } catch (e) {
    return resResponse(false, 'Ha ocurrido un error al subir la imagen')
  }
}

exports.eliminarImagen = async id => {
  try {
  	const { public_id } = await Imagen.findByIdAndRemove(id)
  	await cloudinary.uploader.destroy(public_id)
    return resResponse(true, 'La imagen se borró correctamente')
  } catch(e) {
    return resResponse(false, 'Ha ocurrido un error al eliminar la imagen')
  }
}

exports.eliminarCloudinary = async publicid => {
  try {
    await cloudinary.uploader.destroy(publicid)
    return resResponse(true, 'La imagen se borró correctamente')
  } catch(e) {
    return resResponse(false, 'Ha ocurrido un error al eliminar la imagen')
  }
}
