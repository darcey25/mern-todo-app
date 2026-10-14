const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = process.env.PORT || 4000;

let Todo = require('./todo.model');

// Only the React app's origin may call the API (comma-separate several).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todos')
    .then(() => console.log("MongoDB database connection established successfully"))
    .catch(err => {
        console.error("Could not connect to MongoDB:", err.message);
        process.exit(1);
    });

// Copy only the todo fields from a request body; anything else is ignored.
function todoFields(body) {
    const { todo_description, todo_responsible, todo_priority, todo_completed } = body || {};
    return { todo_description, todo_responsible, todo_priority, todo_completed };
}

todoRoutes.route('/').get(async function(req, res) {
    res.json(await Todo.find());
});

todoRoutes.route('/:id').get(async function(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send("data is not found");
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
        return res.status(404).send("data is not found");
    }
    res.json(todo);
});

todoRoutes.route('/update/:id').post(async function(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send("data is not found");
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
        return res.status(404).send("data is not found");
    }
    todo.set(todoFields(req.body));
    try {
        await todo.save();
        res.json('Todo updated!');
    } catch (err) {
        res.status(400).send("Update not possible");
    }
});

todoRoutes.route('/add').post(async function(req, res) {
    try {
        await new Todo(todoFields(req.body)).save();
        res.status(200).json({'todo': 'todo added successfully'});
    } catch (err) {
        res.status(400).send('adding new todo failed');
    }
});

app.use('/todos', todoRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
