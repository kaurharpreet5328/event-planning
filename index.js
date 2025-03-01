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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const db = client.db('eventplanning');
        const users = db.collection('users');
        const user = await users.findOne({ email, password });

        if (user) {
            console.log(`User logged in: ${email}`);
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

app.post('/chat', async (req, res) => {
    const { chatSectionId,chatName, role, message } = req.body;
    if (!chatSectionId || !role || !message) {
        return res.status(400).send('chatSectionId, chatName, role, and message are required');
    }
    try {
        const db = client.db('eventplanning');
        const chats = db.collection('chats');
        const newChat = { chatSectionId, chatName, role, message };
        const result = await chats.insertOne(newChat);
        console.log(`New chat created with id: ${result.insertedId}`);
        res.status(201).send(`Chat created with ID: ${result.insertedId}`);
    }
    catch (err) {
        console.error('Error creating chat:', err);
        res.status(500).send('Error creating chat');
    }
});

app.get('/chat/:chatSectionId', async (req, res) => {
    const chatSectionId = req.params.chatSectionId;
    if (!chatSectionId) {
        return res.status(400).send('chatSectionId is required');
    }
    try {
        const db = client.db('eventplanning');
        const chats = db.collection('chats');
        const chatList = await chats.find({ chatSectionId }).toArray();

        if (chatList) {
            console.log(`Chat list for chatSectionId: ${chatSectionId}`);
            res.status(200).json(chatList);
        } else {
            res.status(404).send('Chat not found');
        }
    } catch (err) {
        console.error('Error getting chats:', err);
        res.status(500).send('Error getting chats');
    }
});

app.delete('/chat/:chatSectionId', async (req, res) => {
    const chatSectionId = req.params.chatSectionId;
    try {
        const db = client.db('eventplanning');
        const chats = db.collection('chats');
        await chats.deleteMany({ chatSectionId });
        res.status(200).send(`All messages deleted with chatSectionId: ${chatSectionId}`);
    } catch (err) {
        res.status(500).send('Error deleting chat');
    }
});