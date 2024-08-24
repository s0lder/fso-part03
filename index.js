const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('person', (request, response) => {
  return JSON.stringify(request.person || {})
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

let persons = []

const handleError = (response, status, msg) => response.status(status).json({ error: msg })

app.get('/api/persons', (request, response) => response.json(persons))

app.get('/info', (request, response) => {
  const date = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people</p>${date}`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  person ? response.json(person) : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body
  
  if (!name)
    return handleError(response, 400, 'name missing')
  else if (!number)
    return handleError(response, 400, 'number missing')
  else if (persons.some(person => person.name === name))
    return handleError(response, 409, 'name already exists')

  const person = {
    id: String(Math.floor(Math.random() * 100000000)),
    name: name,
    number: number
  }

  persons = persons.concat(person)

  request.person = { name, number }

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})