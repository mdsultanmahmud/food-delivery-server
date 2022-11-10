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

// jwt implement
app.post('/jwt', (req, res) => {
    const user = req.body
    // console.log(user)
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '2h' })
    res.send({ token })
})


// verify jwt token 
const verifyJWT = (req, res, next) => {
    const authorizationTokenHead = req.headers.authaccesstoken
    if (!authorizationTokenHead) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorize access'
        })
    }
    const token = authorizationTokenHead.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            return res.status(401).send({
                success: false,
                message: 'Unauthorize access'
            })
        }
        req.decoded = decoded
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p11nzlu.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const Foods = client.db('FoodDelivery').collection('foods')
    const Reviews = client.db('FoodDelivery').collection('reviews')
    // get limited item 
    app.get('/limitedService', async (req, res) => {
        const cursor = Foods.find({})
        const result = await cursor.limit(3).toArray()
        res.send(result)
    })
    // get all service 
    app.get('/services', async (req, res) => {
        const query = {}
        const cursor = Foods.find(query)
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
        const cursor = Reviews.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })

    // get review filtering by gmail
    app.get('/reviewWithGmail', verifyJWT, async (req, res) => {
        const query = req.query
        const cursor = Reviews.find(query)
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

        const result = await Reviews.updateOne(query,updatedRev,option)
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