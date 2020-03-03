const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const database = require('./database');

beforeAll(async(done) => {
    const url = 'mongodb://127.0.0.1/LuxuryOutfitRentalShop'
    await mongoose.connect(url, { useNewUrlParser: true })
    done()
})

describe('GET /items', () => {
    let res

    beforeAll(async (done) => {
        res = await supertest(app).get('/items')
        done()
    })
    test('send a response of 200', () => {
        expect(res.status).toBe(200)
    })
    test('sends back a body which is formatted following JSend guidelines', () => {
        expect(res.body).toMatchObject({
            status: 'success'
        })
    })
})

describe('POST /items', () => {
    describe('valid information', () => {
        let res, createdId, numOfItemsBefore, numOfItemsAfter;

        const createdItem = {
            name: 'Blouse',
            size: 'S',
            collectionDate: 2019,
            colour: 'red',
            quantityInStock: 4
        }

        beforeAll(async (done) => {
            const itemsBefore = await Item.find({})
            numOfItemsBefore = itemsBefore.length;

            res = await supertest(app).post('items').send({ createdItem })

            const itemsAfter = await Item.find({})
            numOfItemsAfter - itemsAfter.length
            done()
        })
        test('the response is 201', () => {

        })
        test('the response body send back the createdItem', () => {

        })
        test('the createdItem has an Id', () => {

        })
        test('an item with that id exists in the database', () => {

        })
        test('only one item exists in the database', () => {
            
        })
    })


})