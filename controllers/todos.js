const Todo = require('../models/Todo')
const food = require('../public/data/food.json')

module.exports = {
    getTodos: async (req,res)=>{
        console.log(req.user)
        try{
            //gets todo data from database
            let todoItems;
            let itemsLeft;
            if (req.user.chef === 'on') {
                todoItems = await Todo.find()
                itemsLeft = await Todo.countDocuments({completed: false})
            } else {
                todoItems = await Todo.find({userId:req.user.id})
                itemsLeft = await Todo.countDocuments({userId:req.user.id,completed: false})
            }
            todoItems.map((item) => {item.foodData = food[item.todo.toLowerCase().replaceAll(" ", "")]})
            const total = todoItems.reduce((acc, el) => {return acc+el.foodData.price},0)
            const foodList = Object.keys(food).map(key => food[key]);
            //renders todos page, passes in todo data
            res.render('todos.ejs', {todos: todoItems, left: itemsLeft, user: req.user, total: total, foodList: foodList})
        }catch(err){
            console.log(err)
        }
    },
    createTodo: async (req, res)=>{
        try{
            await Todo.create({todo: req.body.todoItem, completed: false, userId: req.user.id})
            console.log('Todo has been added!')
            res.redirect('/todos')
        }catch(err){
            console.log(err)
        }
    },
    markComplete: async (req, res)=>{
        try{
            if (req.user.chef !== 'on') return;
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: true
            })
            console.log('Marked Complete')
            res.json('Marked Complete')
        }catch(err){
            console.log(err)
        }
    },
    markIncomplete: async (req, res)=>{
        try{
            if (req.user.chef !== 'on') return;
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: false
            })
            console.log('Marked Incomplete')
            res.json('Marked Incomplete')
        }catch(err){
            console.log(err)
        }
    },
    deleteTodo: async (req, res)=>{
        console.log(req.body.todoIdFromJSFile)
        try{
            await Todo.findOneAndDelete({_id:req.body.todoIdFromJSFile})
            console.log('Deleted Todo')
            res.json('Deleted It')
        }catch(err){
            console.log(err)
        }
    }
}    