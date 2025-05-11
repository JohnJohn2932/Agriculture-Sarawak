require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const upload = multer();
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

let db, users;

MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    db = client.db('greengrow');
    users = db.collection('users');
    console.log('Connected to MongoDB Atlas');

    // Test DB connection
    app.get('/test-db', async (req, res) => {
      try {
        const testDoc = { test: 'connection' };
        const result = await users.insertOne(testDoc);
        await users.deleteOne({ _id: result.insertedId });
        res.json({ success: true, message: 'Database connection successful!' });
      } catch (e) {
        res.json({ success: false, message: `Database connection failed: ${e}` });
      }
    });

    // Serve index.html at root
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    // Registration endpoint
    app.post('/register', upload.none(), async (req, res) => {
      try {
        const data = req.body;
        // Username validation: max 11 chars, no spaces
        const username = data.fullName;
        if (!username || username.length > 11 || /\s/.test(username)) {
          return res.json({ success: false, message: 'Username must be 1-11 characters, no spaces.' });
        }
        const existing = await users.findOne({ username });
        if (existing) {
          return res.json({ success: false, message: 'Username already taken!' });
        }
        const existingEmail = await users.findOne({ email: data.email });
        if (existingEmail) {
          return res.json({ success: false, message: 'Email already registered!' });
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = {
          username: username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          password: hashedPassword,
          profilePic: '/assets/default-avatar.png'
        };
        await users.insertOne(user);
        res.json({ success: true, message: 'Registration successful!' });
      } catch (e) {
        res.json({ success: false, message: e.message });
      }
    });

    // Login endpoint
    app.post('/login', upload.none(), async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
          res.json({
            success: true,
            message: 'Login successful!',
            fullName: user.full_name || user.username || 'User',
            username: user.username || user.full_name || 'User',
            email: user.email,
            profilePic: user.profilePic || '/assets/default-avatar.png'
          });
        } else {
          res.json({ success: false, message: 'No Email Account Registered Under This Email' });
        }
      } catch (e) {
        res.json({ success: false, message: e.message });
      }
    });

    // Avatar upload endpoint
    app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
      try {
        // You should have user authentication/session to identify the user
        // For example, get user email from session/cookie/token
        const userEmail = req.body.email || req.user?.email; // Adjust as per your auth logic

        if (!req.file) {
          return res.json({ success: false, message: 'No file uploaded' });
        }

        // Save as base64 in DB (simple for small images)
        const base64Image = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        await users.updateOne(
          { email: userEmail },
          { $set: { profilePic: imageUrl } }
        );

        res.json({ success: true, imageUrl });
      } catch (e) {
        res.json({ success: false, message: e.message });
      }
    });

    // Unified profile update endpoint
    app.post('/update-profile', upload.single('avatar'), async (req, res) => {
      try {
        // Identify user by previous email (should be sent as oldEmail in the request or from session)
        // For demo, use email from body (in real app, use session/JWT)
        const {
          username,
          email,
          phone,
          address,
          oldEmail, // send this from frontend if user can change email
          city,
          state,
          postcode,
          password
        } = req.body;
        const userEmail = oldEmail || email;

        const updateFields = {
          username,
          email,
          phone,
          address
        };

        if (city) updateFields.city = city;
        if (state) updateFields.state = state;
        if (postcode) updateFields.postcode = postcode;
        if (password) {
          updateFields.password = await bcrypt.hash(password, 10);
        }

        let profilePic;
        if (req.file) {
          const base64Image = req.file.buffer.toString('base64');
          profilePic = `data:${req.file.mimetype};base64,${base64Image}`;
          updateFields.profilePic = profilePic;
        }

        await users.updateOne(
          { email: userEmail },
          { $set: updateFields }
        );

        res.json({ success: true, profilePic });
      } catch (e) {
        res.json({ success: false, message: e.message });
      }
    });

    // Endpoint to get user info by email
    app.get('/user-info', async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.json({ success: false, message: 'No email provided' });
        const user = await users.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User not found' });
        console.log('[DEBUG] user from DB:', user);
        res.json({
          success: true,
          user: {
            username: user.username || user.full_name || '',
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city || '',
            state: user.state || '',
            postcode: user.postcode || '',
            profilePic: user.profilePic
          }
        });
      } catch (e) {
        res.json({ success: false, message: e.message });
      }
    });

    // Start server after routes are set up
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
