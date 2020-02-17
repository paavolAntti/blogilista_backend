const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/post')
const User = require('../models/user')
const bcypt = require('bcrypt')


const loginUser = {
	username: 'hikiantti',
	password: 'salasana',
	name: 'Antti Paavola'
}
const firstBlog = {
	title: 'Nostack developement',
	author: 'Antti Paavola',
	url: 'nostack.com',
	likes: 1000
}
let userid = 0

beforeEach(async () => {
	//Alustetaan tietokanta
	await User.deleteMany({})
	await Blog.deleteMany({})
	// Luodaan käyttäjä
	const saltRounds = 10
	const passwordHash = await bcypt.hash(loginUser.password, saltRounds)
	const initialUser = new User({
		username: loginUser.username,
		name: loginUser.name,
		passwordHash
	})
	// Tallennetaan käyttäjä
	await initialUser.save()

	userid = await (await api.get('/api/users')).body[0].id
	console.log(userid)

	let initialBlog = new Blog({
		title: firstBlog.title,
		author: firstBlog.author,
		url: firstBlog.url,
		likes: firstBlog.likes,
		user: userid

	})
	await initialBlog.save()

})

describe('posting blog', () => {

	test('correct number of posts returned', async () => {
		const response = await api.get('/api/blogs')

		expect(response.body.length).toBe(1)
	})

	test('correctly named id field', async () => {
		const response = await api.get('/api/blogs')

		expect(response.body[0].id).toBeDefined()
	})

	test('a  blog can be posted', async () => {
		const newBlog = {
			title: 'testblog3',
			author: 'integration tester',
			url: 'integration.tester.com',
			likes: 99,
			user: userid
		}

		const login = await api
			.post('/api/login')
			.send(loginUser)
			.expect(200)

		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${login.body.token}`)
			.send(newBlog)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const response = await api.get('/api/blogs')
		const contents = response.body.map(r => r.title)
		expect(response.body.length).toBe(2)
		expect(contents).toContain('testblog3')
	})

	test('blog cant be posted with no token', async () => {
		const newBlog = {
			title: 'testblog5',
			author: 'integration tester2',
			url: 'integration.tester2.com',
			likes: 1002,
			user: userid
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(401)

		const response = await api.get('/api/blogs')
		const contents = response.body.map(r => r.title)
		expect(response.body.length).toBe(1)
		expect(contents).not.toContain('testblog5')
	})

	test('default value of 0 for like-property', async () => {
		const newBlog = {
			title: 'testblog3',
			author: 'integration tester',
			url: 'integration.tester.com',
			user: userid
		}
		const login = await api
			.post('/api/login')
			.send(loginUser)
			.expect(200)
		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${login.body.token}`)
			.send(newBlog)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const response = await api.get('/api/blogs')
		expect(response.body[response.body.length-1].likes).toBe(0)
	})

	test('a post with no title and url is bad request', async () => {
		const newBlog = {
			author: 'integration tester',
			likes: 99,
			user: userid
		}
		const login = await api
			.post('/api/login')
			.send(loginUser)
			.expect(200)
		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${login.body.token}`)
			.send(newBlog)
			.expect(400)
	})

	test('deletion of a note', async () => {
		const blogsAtBeginning = await api.get('/api/blogs')
		const idToRemove = blogsAtBeginning.body[0].id
		const login = await api
			.post('/api/login')
			.send(loginUser)
			.expect(200)
		await api
			.delete(`/api/blogs/${idToRemove}`)
			.set('authorization', `bearer ${login.body.token}`)
			.expect(204)

		const blogsAfterDeletion = await api.get('/api/blogs')

		const titles = blogsAfterDeletion.body.map(r => r.title)

		expect(titles).not.toContain(firstBlog.title)
	})

	test('updating a note', async () => {
		const blogsAtBeginning = await api.get('/api/blogs')
		const idToUpdate = blogsAtBeginning.body[0].id

		const newBlog = {
			title: 'updateTestTitle'
		}

		await api
			.put(`/api/blogs/${idToUpdate}`)
			.send(newBlog)
			.expect(200)

		const blogsAfterUpdate = await api.get('/api/blogs')
		const titles = blogsAfterUpdate.body.map(r => r.title)

		expect(titles).not.toContain(firstBlog.title)
		expect(titles).toContain(newBlog.title)
	})

})

describe('user creation testing', () => {
	test('new user creation with fresh password', async () => {
		const usersAtStart = await api.get('/api/users')

		const newUser = {
			username: 'testuser',
			name: 'Test User',
			password: 'secretword'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await api.get('/api/users')
		expect(usersAtEnd.body.length).toBe(usersAtStart.body.length + 1)

		const usernames = usersAtEnd.body.map(u => u.username)
		expect(usernames).toContain(newUser.username)

	})

	test('user creation with taken username', async () => {
		const usersAtStart = await api.get('/api/users')

		const newUser = {
			username: 'hikiantti',
			name: 'Test User',
			password: 'ihmejakumma'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		const usersAtEnd = await api.get('/api/users')
		expect(usersAtEnd.body.length).toBe(usersAtStart.body.length)
	})

	test('user creation with no password', async () => {
		const usersAtStart = await api.get('/api/users')

		const newUser = {
			username: 'testuser77',
			name: 'Test User',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		const usersAtEnd = await api.get('/api/users')
		expect(usersAtEnd.body.length).toBe(usersAtStart.body.length)
	})

	test ('user creation with no username', async () => {
		const usersAtStart = await api.get('/api/users')

		const newUser = {
			name: 'Test User',
			password: 'passu'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)

		const usersAtEnd = await api.get('/api/users')
		expect(usersAtEnd.body.length).toBe(usersAtStart.body.length)
	})
})



afterAll(() => {
	mongoose.connection.close()
})