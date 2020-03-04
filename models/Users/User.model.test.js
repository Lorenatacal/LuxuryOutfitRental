const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User.model');

beforeAll(async () => {
    const url = 'mongodb://127.0.0.1/LuxuryOutfitRentalShop'
    await mongoose.connect(url, { useNewUrlParser: true })
})

describe('Password storage', () => {
    let user

    beforeAll(async (done) => {
        user = await User.create({ userName: 'Tudor', email: 'tudortacal@domanin.com', password: 'randomPass' })
        done()
    })

    test('Does not store the plain text password', () => {
        expect(user.password).not.toBeUndefined()
        expect(user.password).not.toBe('randomPass')
    })
    test('specifically stores an encrypted version of the plaintext password', async (done) => {
        const isMatched = await bcrypt.compare('randomPass', user.password)
        expect(isMatched).toBeTruthy()
        done()
    })
})