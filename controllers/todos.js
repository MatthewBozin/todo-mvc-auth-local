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
                //if the user is a chef, display all todos
                todoItems = await Todo.find()
                itemsLeft = await Todo.countDocuments({completed: false})
            } else {
                //if the user is not a chef, display only their todos
                todoItems = await Todo.find({userId:req.user.id})
                itemsLeft = await Todo.countDocuments({userId:req.user.id,completed: false})
            }

            //for each item in todoItems array,
            //use its todo text to find its entry in food.json and add that data as a property to the item object
            todoItems.map((item) => {item.foodData = food[item.todo.toLowerCase().replaceAll(" ", "")]})

            //cycle through each item in todoItems and add its price to the total
            //this is our culprit for the crashes 
            const total = todoItems.reduce((acc, el) => {
                if (!el) return acc;
                return acc+el.foodData.price
            },0).toFixed(2);

            //turns food.json into an array of objects, one object for each type of food
            const foodList = Object.keys(food).map(key => food[key]);

            //renders todos page, passes in data that will be consumed by todos.ejs
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