const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err)
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const productsCollection = client.db('lappy').collection('products');
        const usersCollection = client.db('lappy').collection('users');
        const categoriesCollection = client.db('lappy').collection('categories');

        // app.get("/products/:id", async (req, res) => {
        //     const id = req.params.id;
        //     console.log("id: ", id)
        //     const query = { _id: ObjectId(id) }
        //     const result = await productsCollection.findOne(query).toArray();
        //     res.send(result)
        // })

        app.get("/products", async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })

        //TODO: verify if seller account
        app.post("/products", verifyJWT, async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })

        app.delete("/products/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })

        app.put("/products/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const data = req.body
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: data
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        //get products added by specific user
        app.get("/products/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })

        app.get("/advertised", async (req, res) => {
            const query = {
                isAdvertised: true,
                status: "listed"
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        });

        app.get("/users", async (req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            console.log("email", email)
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result)
        })

        app.post("/users", verifyJWT, async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.isAdmin });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/categories/:name', async (req, res) => {
            const name = req.params.name
            const query = { category: name };
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });
    }
    finally {

    }
}
run().catch(console.log);






app.listen(PORT, () => {
    console.log("Server is running on port, ", PORT)
})