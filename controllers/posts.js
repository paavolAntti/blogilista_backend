require('dotenv').config()
const blogRouter = require('express').Router()
const Blog = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })

	response.json(blogs.map(blog => blog.toJSON()))
})


blogRouter.post('/', async (request, response, next) => {
	const body = request.body

	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		const user = await User.findById(decodedToken.id)
		const post = new Blog({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes || 0,
			user: user._id
		})

		const savedBlog = await post.save()
		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		response.json(savedBlog.toJSON())
	} catch (exception) {
		next(exception)
	}

})

blogRouter.delete('/:id', async (request, response, next) => {
	console.log('token: ', request.token)
	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}
	const user = await User.findById(decodedToken.id)
	const blogToDelete = await Blog.findById(request.params.id)
	if (user.id.toString() !== blogToDelete.user.toString()) {
		return response.status(401).json({ error: 'invalid user' })
	}
	try {
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} catch (exception) {
		next(exception)
	}
})

blogRouter.put('/:id', async (request, response, next) => {
	const body = request.body

	const post = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		comments: body.comments
	}
	try {
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, post)
		response.json(updatedBlog.toJSON())
	} catch (exception) {
		next(exception)
	}
})

blogRouter.put('/:id/comments', async (request, response, next) => {
	const body = request.body

	const post = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		comments: body.comments
	}
	try {
		const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, post)
		response.json(updatedBlog.toJSON())
	} catch (exception) {
		next(exception)
	}
})

module.exports = blogRouter