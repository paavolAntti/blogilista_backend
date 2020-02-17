/* eslint-disable no-unused-vars */

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let total = 0
	blogs.forEach(blog => {
		total += blog.likes
	})
	return total
}

const favoriteBlog = (blogs) => {
	let favorite = { }
	let mostLikes = 0
	blogs.forEach(blog => {
		if (blog.likes > mostLikes) {
			mostLikes = blog.likes
			favorite = blog
		}
	})
	return { title: favorite.title, author: favorite.author, likes: favorite.likes }
}

const mostBlogs = (blogs) => {
	const uniqueAuthors = [...new Set(blogs.map(blog => blog.author))]
	let authors = uniqueAuthors.map(post => ({ author: post, blogs: 0 }))
	blogs.forEach(element => {
		const hit = authors.find(post => post.author === element.author)
		if (hit) {
			hit.blogs += 1
		}

	})
	authors.sort((a,b) => {
		return b.blogs - a.blogs
	})
	return authors[0]
}

const favoriteAuthor = (blogs) => {
	const uniqueAuthors = [...new Set(blogs.map(blog => blog.author))]
	let authors = uniqueAuthors.map(post => ({ author: post, likes: 0 }))
	blogs.forEach(element => {
		const hit = authors.find(post => post.author === element.author)
		if (hit) {
			hit.likes += element.likes
		}

	})
	authors.sort((a,b) => {
		return b.likes - a.likes
	})
	return authors[0]
}


module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	favoriteAuthor

}