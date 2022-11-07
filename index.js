const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()
// middleware
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p11nzlu.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const  Foods = client.db('FoodDelivery').collection('foods')
    const Reviews = client.db('FoodDelivery').collection('reviews')
    // get all service 
    app.get('/services', async(req, res) =>{
         const query = {}
         const cursor = Foods.find(query)
         const foods = await cursor.toArray()
         res.send(foods)
    })

    // add one service 
    app.post('/services', async(req,res) =>{
        const service = req.body 
        const result = await Foods.insertOne(service)
        res.send(result)
    })

    // post review 
    app.post('/reviews', async(req, res) =>{
        const review = req.body 
        const result = await Reviews.insertOne(review)
        res.send(result)
    })

    // get review by services id 
    app.get('/reviewWithId/:id', async(req,res) =>{
        const id = req.params.id 
        console.log(id)
        const query = {_id: ObjectId(id)}
        const cursor = Reviews.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })

    // get review filtering by gmail
    app.get('/reviewWithGmail', async(req,res) =>{
        const query = req.query
        const cursor = Reviews.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })
}

run().catch(err => console.log(err))

app.get('/', (req, res) =>{
    res.send('Food Delivery server running!!!')
}) 

app.listen(port, ( ) =>{
    console.log('server running from port: ', port)
})