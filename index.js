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

const uri = "mongodb+srv://<username>:<password>@cluster0.uh9rxet.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//routes
app.get('/', (req, res) => {
    res.send("server is running")
})








app.listen(PORT, () => {
    console.log("Server is running on port, ", PORT)
})