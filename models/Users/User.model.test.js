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

describe('Validation', () => {
    describe('Emails validation', () => {
        describe('Emails to accept', () => {
            test('tudor@domain.com', async (done) => {
                await User.create({ email: "tudor@domain.com", password: 'randomPassword'}, (err) => {
                    expect(err).toBeNull()
                    done()
                })
            })
            test('tudor@domain.co.uk', async (done) => {
                await User.create({ email: "tudor@domain.co.uk", password: 'randomPassword' }, (err) => {
                    expect(err).toBeNull()
                    done()
                })
            })
        })
        describe('Emails to reject', () => {
            test('tudor@', async (done) => {
                await User.create({ email: "tudor@", password: 'randomPassword' }, (err) => {
                    expect(err).not.toBeNull()
                    done()
                })
            })
            test('tudor@domain', async (done) => {
                await User.create({  email: "tudor@domain", password: 'randomPassword' }, (err) => {
                    expect(err).not.toBeNull()
                    done()
                })
            })
        })
    })
})