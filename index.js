require('dotenv').config({ path: 'variables.env' })
require('./config/db')
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const createError = require('http-errors')
const passport = require('./config/passport')

const port = process.env.PORT
const host = '0.0.0.0'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('handlebars', exphbs({
	handlebars: allowInsecurePrototypeAccess(handlebars),
	defaultLayout: 'layout',
	helpers: require('./helpers/handlebars')
}))

app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

app.use(session({
	secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: mongoose.connection
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
	res.locals.mensaje = error.message
	const status = error.status || 500
	res.locals.status = status
	res.status(status)
	res.render('error')
})

app.listen(port, host, () => console.log(`Servidor en puerto ${port}`))
