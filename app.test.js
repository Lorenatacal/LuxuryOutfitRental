const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const database = require('./database');
const Item = require('./models/Item.model')

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

            res = await supertest(app).post('/items').send(createdItem)

            const itemsAfter = await Item.find({})
            numOfItemsAfter = itemsAfter.length
            done()
        })
        test('the response is 201', () => {
            expect(res.status).toBe(201)
        })
        test('the response body send back the createdItem', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                data: {
                    createdItem
                }
            })
        })
        test('the createdItem has an Id', () => {
            expect(res.body.data.createdItem).toHaveProperty('_id')
            createdId = res.body.data.createdItem._id
        })
        test('an item with that id exists in the database', async (done) => {
            const item = await Item.findById(createdId)
            expect(item).not.toBeNull()
            expect(item.id).toEqual(createdId)
            done()
        })
        test('only one item exists in the database', () => {
            expect(numOfItemsAfter).toEqual(numOfItemsBefore + 1)
        })
    })
})

describe('DELETE /items/:id', () => {
    describe('valid id', () => {
        const idToDelete = 'erd123f'
        let res

         beforeAll(() => {
             database.items = {
                erd123f: 'Blouse',
                fgt34rfd: 'Jeans'
             }
         })

        test('A response will be sent back when the item is deleted', async () => {
            res = await supertest(app).delete(`/items/${idToDelete}`)
    
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                status: 'success',
                message: `Item ${idToDelete} has been deleted`
            })
        })
        // test('The item has been removed from the database', () => {

        // })
        // test('Only that specific item has been deleted', () => {

        // })
    })
})