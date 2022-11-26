const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uh9rxet.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//routes
app.get('/', (req, res) => {
    res.send("server is running")
})



async function run() {
    try {
        const productsCollection = client.db('lappy').collection('products');
        const usersCollection = client.db('lappy').collection('users');

        app.get("/advertised", async (req, res) => {
            const query = {
                isAdvertised: true
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        });

        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = usersCollection.insertOne(user);
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.log);






app.listen(PORT, () => {
    console.log("Server is running on port, ", PORT)
})