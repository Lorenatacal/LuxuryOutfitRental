const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User.model');

beforeAll(async () => {
    const url = 'mongodb://127.0.0.1/Store'
    await mongoose.connect(url, { useNewUrlParser: true })
})