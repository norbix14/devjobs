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

## Pasos

Clonar este repositorio

**`git clone <repository>`**

Instalar las dependencias necesarias

**`npm i`**

Ejecuta la **[App](http://localhost:5000)** (elegir puerto a gusto)

**`npm run desarrollo`** para crear el `bundle` de desarrollo. `webpack --watch --mode development`

**`npm run produccion`** para crear el `bundle` de produccion. `webpack --mode production`

## Este proyecto utiliza los siguientes elementos

### Requeridos

**[Cloudinary](https://cloudinary.com/ "Para subir las imagenes de la página")**

**[MongoDBAtlas](https://cloud.mongodb.com/user#/atlas/login "Guardar datos de las vacantes y los usuarios")**

### Opcionales (optimización de imagenes, envío de emails)

**[MailTrap](https://mailtrap.io/ "Envío de email para la confirmación de la cuenta")**

**[Tinify](https://tinypng.com/ "Optimización de imagenes")**
