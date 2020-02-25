const bcypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (request, response, next) => {

	const body = request.body
	if (body.password !== undefined) {
		const saltRounds = 10
		const passwordHash = await bcypt.hash(body.password, saltRounds)
		const user = new User({
			username: body.username,
			name: body.name,
			passwordHash
		})
		try {
			const savedUser = await user.save()
			response.json(savedUser)
		} catch(exception) {
			next(exception)
		}
	} else {
		return response.status(400).json({ error: 'password required' })
	}
})

userRouter.get('/', async (request, response) => {
	const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 } )

	response.json(users.map(user => user.toJSON()))
})

userRouter.get('/:id', async (request, response) => {
	const user = await User.findById(request.params.id)

	response.json(user.toJSON())
})
module.exports = userRouter