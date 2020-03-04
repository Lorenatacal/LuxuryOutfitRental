const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const database = require('./database');
const Item = require('./models/Items/Item.model');
const Outfit = require('./models/Outfits/Outfit.model')

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

describe('GET /items/:id', () => {
    describe('valid id', () => {
        const idToSearch = 'erd123f'
        let res

        beforeAll(() => {
            database.items = {
                erd123f: 'Blouse',
                fgt34rfd: 'Jeans'
            }
        })
        test('send a response of 200 when the id exists', async (done) => {
            res = await supertest(app).get(`/items/${idToSearch}`)
            expect(res.status).toBe(200)
            done()
        })
        test('the response body sends back the created id', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                data: {
                    items: database.items[idToSearch]
                }
            })
        })
    })
    describe('invalid id', () => {
        let res
        test('send a response of 404 when the id does not exist', async (done) => {
            res = await supertest(app).get(`/items/${'fdghfà23'}`)
            expect(res.status).toBe(404)
            done()
        })
        test('the response body sends back a failing message', async (done) => {
            res = await supertest(app).get('/items/id')
            expect(res.body).toMatchObject({
                status: 'fail',
                message: 'The item was not found'
            })
            done()
        })
    })
})

describe('GET /outfits/:id', () => {
    describe('valid id', () => {
        let idToSerch
        let res

        beforeAll(() => {
            database.outfits = {
                ard12drs: 'Dior Night Outfit',
                fgt34rfd: 'Dior Day Outfit'
            }
            idToSerch = 'ard12drs'
        })
        test('send a response of 200 when the id exists', async (done) => {
            res = await supertest(app).get(`/outfits/${idToSerch}`)
            expect(res.status).toBe(200)
            done()
        })
        test('the response body sends back the expected id', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                data: {
                    outfit: database.outfits[idToSerch]
                }
            })
        })
    })
    describe('invalid id', () => {
        let res
        test('send a response of 404 when the id does not exist', async (done) => {
            res = await supertest(app).get(`/outfits/${'fdghfà23'}`)
            expect(res.status).toBe(404)
            expect(res.body).toMatchObject({
                status: 'fail',
                message: `The outfit with the id: ${'fdghfà23'} does not exist`
            })
            done()
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
        test('The item has been removed from the database', () => {
            expect(database.items).not.toHaveProperty(idToDelete)
        })
        test('Only that specific item has been deleted', () => {
            expect(Object.keys(database.items)).toHaveLength(1)
            expect(database.items).toHaveProperty('fgt34rfd')
        })
    })
})

describe('POST /Outfit', async () => {
    describe('create a new outfit with items inside', () => {
        let res, createdOutfit
        beforeAll(async (done) => {
            res = await supertest(app).post('/outfits').send({
                name: 'Glamourous Dior Night Outfit',
                items: [
                    {
                        name: 'Dior Shirt',
                        size: 'S',
                        collectionDate: 2019,
                        colour: 'red',
                        quantityInStock: 1
                    },
                    {
                        name: 'Skirt',
                        size: 'S',
                        collectionDate: 2019,
                        colour: 'black',
                        quantityInStock: 1
                    },
                    {
                        name: 'Heels',
                        size: 'S',
                        collectionDate: 2019,
                        colour: 'red',
                        quantityInStock: 1
                    },
                    {
                        name: 'Bag',
                        size: 'S',
                        collectionDate: 2019,
                        colour: 'black',
                        quantityInStock: 1
                    }
                ]
            })
            done()
        })
        test('Respond with 201 when is successful', () => {
            expect(res.status).toBe(201)
        })
        test('Returns the created outfit with the response', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                data: {
                    outfit: {
                        name: 'Glamourous Dior Night Outfit'
                    }
                }
            })
            createdOutfit = res.body.data.outfit
        })
        test('Creates an outfit that has an array of items ids', () => {
            expect(createdOutfit).toHaveProperty('items')
        })
        test('Has created an item for each of this associated ids', () => {
            createdOutfit.items.forEach(async (itemId) => {
                const itemFound = await Outfit.findById(itemId)
                expect(itemFound).toBeDefined()
            })
        })
    })
})

describe('Get /Outfits', () => {
    let res

    beforeAll(async(done) => {
        res = await supertest(app).get('/outfits')
        done()
    })
    test('send a response of 200', () => {
        expect(res.status).toBe(200)
    })
    test('sends back a body with a status of success', () => {
        expect(res.body).toMatchObject({
            status: 'success'
        })
    })
})