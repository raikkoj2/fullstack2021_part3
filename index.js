const express = require('express')
const app = express()

const morgan = require('morgan')
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))



morgan.token('data', function (req, res, method) { if(method === 'POST'){return JSON.stringify(req.body)}})

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req,res, tokens.method(req, res))
    ].join(' ')
  })
)



let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
      },
      {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
      },
      {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
      },
      {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
      }
]

app.get('/', (request, response) => {
    response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const date = new Date()
    const message = `Phonebook has info for ${persons.length} people`

    response.send(`<div>${message}</div> <br /> <div>${date}</div>`)
})


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name && !body.number){
        return response.status(400).json({ 
         error: 'name and number missing' 
       })
    } else if(!body.name){
       return response.status(400).json({ 
        error: 'name missing' 
      })
    } else if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }


    const exists = persons.find(person => person.name === body.name)

    //exists is really a person object and not a boolean value but if find doesn't
    //find anything it returns undefined and it has boolean value of false/falsy
    //all objects have boolean value true/truthy
    if(exists){
        return response.status(400).json({
            error: `${body.name} is already in the phonebook`
        })
    }

    const person = {
        id: generateId(10000),
        name: body.name,
        number:  body.number,
    }

    persons = persons.concat(person)

    response.json(person)

})

const generateId = (max) => {
    return Math.floor(Math.random() * max)

    // //a better function would be
    // const maxId = persons.length > 0
    //   ? Math.max(...persons.map(p => p.id))
    //   : 0
    // return maxId + 1
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})