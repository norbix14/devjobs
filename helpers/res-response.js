const resResponse = (ok = false, message = 'error') => {
	return { ok, message }
}

module.exports = resResponse
