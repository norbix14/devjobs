# Proyecto [devJobs](https://infinite-peak-70937.herokuapp.com)

Búsqueda y publicación de empleos IT

## Snapshots

![Inicio](/snapshots/inicio.png "Página principal")

![Vacantes](/snapshots/vacantes.png "Todas las vacantes")

![Iniciar sesión](/snapshots/login.png "Iniciar sesión")

![Crear cuenta](/snapshots/crear-cuenta.png "Crear cuenta")

![Dashboard](/snapshots/dashboard.png "Panel de administración")

![Detalles de la vacante](/snapshots/vacante-detalles.png "Detalles de la vacante")

![Vacante nueva](/snapshots/vacante-nueva.png "Vacante nueva")

![Detalles del reclutador](/snapshots/vacante-reclutador.png "Detalles del reclutador")

## Pasos previos

Clonar este repositorio

		git clone <repository>

Instalar las dependencias necesarias

		npm i

Ejecutar la **[App](http://localhost:5000)** (elegir puerto a gusto)

**En etapa de desarrollo**

		npm run desarrollo

Ejecuta `nodemon ./index.js` y `webpack --watch --mode development` mediante `concurrently`

**En etapa de produccion**

		npm run produccion

Ejecuta `nodemon ./index.js` y `webpack --mode production` mediante `concurrently`

**En etapa de despliegue o para probar funcionamiento antes del despliegue**

		npm start

Ejecuta `node ./index.js`

## Este proyecto utiliza los siguientes elementos

### Requeridos

**[Cloudinary](https://cloudinary.com/ "Para subir las imagenes de la página")**

**[MongoDBAtlas](https://cloud.mongodb.com/user#/atlas/login "Guardar datos de las vacantes y los usuarios")**
