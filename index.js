// Suggested code may be subject to a license. Learn more: ~LicenseLog:876041405.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1195450792.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:2866455475.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3972215440.
import express from 'express';
import { MongoClient } from 'mongodb';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
let client;

if (mongoUri) {
    client = new MongoClient(mongoUri);
    client.connect()
    .then(() => console.log('Connected successfully to MongoDB server'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
    
}

app.use(bodyParser.json());

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}!`);
});


app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }
    try {
        const db = client.db('eventplanning');
        const users = db.collection('users');
        const newUser = { name, email, password };
        const result = await users.insertOne(newUser);
        console.log(`New user created with id: ${result.insertedId}`);
        res.status(201).send(`User created with ID: ${result.insertedId}`);
    }
     catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
    }
});