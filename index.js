const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p11nzlu.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHead = req.headers.accesstoken
    if(!authHead){
        return res.status(401).send({message:'Unauthorized Access'})
    }
    const token = authHead.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(401).send({message:'Unauthorized Access'})
        }
        req.decoded = decoded
        next()
    })
}

async function run() {
    const Foods = client.db('FoodDelivery').collection('foods')
    const Reviews = client.db('FoodDelivery').collection('reviews')
    app.post('/jwt', (req, res) => {
        const user = req.body
        const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn: '1h'})
        res.send({token})
    })
    // get limited item 
    app.get('/limitedService', async (req, res) => {
        const cursor = Foods.find({}).sort({
            sortingTime: -1
        })
        const result = await cursor.limit(3).toArray()
        res.send(result)
    })
    // get all service 
    app.get('/services', async (req, res) => {
        const query = {}
        const cursor = Foods.find(query).sort({
            sortingTime: -1
        })
        const foods = await cursor.toArray()

        res.send(foods)
    })

    // get services with particular id 
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const result = await Foods.findOne(query)
        res.send(result)
    })

    // add one service 
    app.post('/services', async (req, res) => {
        const service = req.body
        const result = await Foods.insertOne(service)
        res.send(result)
    })

    // post review 
    app.post('/reviews', async (req, res) => {
        const review = req.body
        const result = await Reviews.insertOne(review)
        res.send(result)
    })

    // get signle review 
    app.get('/reviews/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const result = await Reviews.findOne(query)
        res.send(result)
    })
    // get review by services id 
    app.get('/reviewWithId/:id', async (req, res) => {
        const id = req.params.id
        const query = { serviceId: id }
        const cursor = Reviews.find(query).sort({
            sortingTime: -1
        })
        const result = await cursor.toArray()
        res.send(result)
    })

    // get review filtering by gmail
    app.get('/reviewWithGmail', verifyJWT,async (req, res) => {
        const decoded = req.decoded
        if(decoded.email !== req.query.email){
            return res.status(401).send({message:'Unauthorized Access'})
        }
        const query = req.query
        const cursor = Reviews.find(query).sort({
            sortingTime: -1
        })
        const result = await cursor.toArray()
        res.send(result)
    })

    // delete single review 
    app.delete('/reviewWithGmail/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const result = await Reviews.deleteOne(query)
        res.send(result)
    })
    // get single review 

    app.put('/reviews/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const review = req.body
        const option = { upsert: true }
        const updatedRev = {
            $set: {
                email: review.email,
                price: review.price,
                reviewrImg: review.reviewrImg,
                serviceId: review.serviceId,
                serviceImg: review.serviceImg,
                serviceName: review.serviceName,
                serviceTitle: review.serviceTitle,
                reviewMsg: review.reviewMsg,
                reviewtime: review.reviewtime
            }
        }

        const result = await Reviews.updateOne(query, updatedRev, option)
        res.send(result)

    })



}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Food Delivery server running!!!')
})

app.listen(port, () => {
    console.log('server running from port: ', port)
})