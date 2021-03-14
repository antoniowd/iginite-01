const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const username = request.header('username')
  const user = users.find(user => user.username === username)
  if (user) {
    request.user = user
    next()
  } else {
    response.status(400).json({ error: "User doesn't exist" })
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (!users.find(user => user.username === username)) {
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
    
    users.push(newUser)
    
    return response.status(201).json(newUser)
  } 
  return response.status(400).json({ error: 'User already exists' })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  if (user.todos.find(todo => todo.id === id)) {
    user.todos = user.todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          title,
          deadline: new Date(deadline)
        }
      }
      return todo
    })

    return response.json(user.todos.find(todo => todo.id === id))
  }
  return response.status(404).json({ error: "The todo doesn't exist"})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  if (user.todos.find(todo => todo.id === id)) {
    user.todos = user.todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          done: true
        }
      }
      return todo
    })

    return response.json(user.todos.find(todo => todo.id === id))
  } 
  return response.status(404).json({ error: "The todo doesn't exist"})
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  if (user.todos.find(todo => todo.id === id)) {
    user.todos = user.todos.filter(todo => todo.id !== id)
    return response.status(204).json([])
  }

  return response.status(404).json({ error: 'Task not found' })
});

module.exports = app;