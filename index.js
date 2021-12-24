require('dotenv').config()
require('./config/db')
const express = require('express')
const path = require('path')
const handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const {
	allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const createError = require('http-errors')
const passport = require('./config/passport')

const port = Number(process.env.PORT) || 4000
const host = '0.0.0.0'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', exphbs({
	handlebars: allowInsecurePrototypeAccess(handlebars),
	defaultLayout: 'layout',
	helpers: require('./helpers/handlebars')
}))

app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

app.use(session({
	secret: process.env.SESSION_SECRET,
	key: process.env.SESSION_KEY,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGODB_DATABASE
	})
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
	res.locals.mensajes = req.flash()
	next()
})

app.use('/', router())

app.use((req, res, next) => {
	next(createError(404, 'Página no encontrada'))
})

app.use((error, req, res, next) => {
	const status = error.status || 500
	res.locals.status = status
	res.locals.environment = req.app.get('env')
	res.locals.error = error
	res.status(status)
	res.render('error', {
		nombrePagina: '404 - Not found',
		mensaje: 'Página no encontrada'
	})
})

app.listen(port, host, () => console.log(`Servidor en puerto ${port}`))
