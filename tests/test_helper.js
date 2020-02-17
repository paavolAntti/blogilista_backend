/* eslint-disable no-unused-vars */
const Blog = require('../models/post')

const initialBlogs = [
	{
		title: 'testblog',
		author: 'integration tester',
		url: 'integration.tester.com',
		likes: 99,
		user: '5e42a7f65b8672533399e1a8'
	},
	{
		title: 'testblog2',
		author: 'integration tester2',
		url: 'integration.tester.fi',
		likes: 100,
		user: '5e42a7f65b8672533399e1a8'
	}
]

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(note => note.toJSON())
}

module.exports = {
	initialBlogs, blogsInDb
}