const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()
// middleware
app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p11nzlu.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const  Foods = client.db('FoodDelivery').collection('foods')
    const result = await Foods.insertOne({name:'burdger'})
    console.log(result)
}

run().catch(err => console.log(err))

app.get('/', (req, res) =>{
    res.send('Food Delivery server running!!!')
}) 

app.listen(port, ( ) =>{
    console.log('server running from port: ', port)
})