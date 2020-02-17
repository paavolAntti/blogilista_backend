/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
const User = require('./user')
mongoose.set('useFindAndModify', false)


const blogSchema = new mongoose.Schema({
	title: {
		type:  String,
		required: true
	},
	author: String,
	url: {
		type: String,
		required: true
	},
	likes: Number,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
})

blogSchema.set('toJSON', {
	transform: (document, returnedBlog) => {
		returnedBlog.id = returnedBlog._id.toString()
		delete returnedBlog._id
	}
})


module.exports = mongoose.model('Blog', blogSchema)