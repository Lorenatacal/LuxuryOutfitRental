const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const database = require('./database');
const Item = require('./models/Items/Item.model');
const Outfit = require('./models/Outfits/Outfit.model');
const User = require('./models/Users/User.model');
const OutfitRental = require('./models/OutfitRental/OutfitRental.model')

beforeAll(async(done) => {
    const url = 'mongodb://127.0.0.1/LuxuryOutfitRentalShop'
    await mongoose.connect(url, { useNewUrlParser: true })
    done()
})

describe('GET /items', () => {
    let res
    let item
    beforeAll( async (done) => {
        await Item.deleteMany({});
        item = await Item.create({
            name: 'Dior Shirt',
            size: 'S',
            collectionDate: 2019,
            colour: 'red',
            quantityInStock: 1
        })
        res = await supertest(app).get('/items')
        done()
    })
    test('send a response of 200', () => {
        expect(res.status).toBe(200)
    })
    test('returns the items when successful', () => {
        expect(res.body).toMatchObject({
            status: 'success',
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
        let res, item, idToDelete
        beforeAll(async (done) => {
            item = await Item.create({
                name: 'Dior Shirt',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 1
            })
            idToDelete = item.id
            res = await supertest(app).delete(`/items/${idToDelete}`)
            done()
        })
        test('A response will be sent back when the item is deleted', async () => {
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                status: 'success',
                message: `Item ${idToDelete} has been deleted`
            })
        })
    })
})

describe('GET /items/:id', () => {
    describe('valid id', () => {
        let res, item, itemToSearch

        beforeAll(async (done) => {
            await Item.deleteMany({})
            item = await Item.create({
                name: 'Dior Shirt',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 1
            })
            itemToSearch = await Item.findOne({}),
            res = await supertest(app).get(`/items/${itemToSearch._id}`)
            done()
        })
        test('send a response of 200 when the id exists', async (done) => {
            expect(res.status).toBe(200)
            expect(res.body).toMatchObject({
                status: 'success',
                item: item.name
            })
            done()
        })
    })
    describe('invalid id', () => {
        let res, itemToSearch
        test('send a response of 404 when the id does not exist', async (done) => {
            itemToSearch = {
                id: '5e6235461339dc82e90d461f',
                name: 'Dior Shirt',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 1,
            }
            res = await supertest(app).get(`/items/${itemToSearch.id}`)
            expect(res.status).toBe(404)
            expect(res.body).toMatchObject({
                status: 'fail',
                message: 'The item was not found'
            })
            done()
        })
    })
})

describe('POST /Outfit', () => {
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
describe('GET /outfits', () => {
    let res
    let outfit
    let item 
    beforeAll( async (done) => {
        await Outfit.deleteMany({});
        item = await Item.create({
            name: 'Dior Shirt',
            size: 'S',
            collectionDate: 2019,
            colour: 'red',
            quantityInStock: 1
        })
        outfit = await Outfit.create({
            name: 'Glamourous Dior Night Outfit',
            items: [
                item._id
            ]
        })
        res = await supertest(app).get('/outfits')
        done()
    })
    test('send a response of 200', () => {
        expect(res.status).toBe(200)
    })
    test('returns the outfits when successful', () => {
        expect(res.body).toMatchObject({
            status: 'success',
            outfits: [outfit._id.toString()]
        })
    })
})

describe('GET /outfits/:id', () => {
    describe('valid id', () => {
        let outfitToSearch
        let res, item, outfit

        beforeAll( async (done) => {
            await Outfit.deleteMany({})
            item = await Item.create({
                name: 'Dior Shirt',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 1
            })
            outfit = await Outfit.create({
                name: 'Glamourous Dior Night Outfit',
                items: [
                    item._id
                ]
            })
            outfitToSearch = await Outfit.findOne({})
            res = await supertest(app).get(`/outfits/${outfitToSearch._id}`)
            done()
            
        })
        test('send a response of 200 when the id exists', async (done) => {
            expect(res.status).toBe(200)
            done()
        })
        test('the response body sends back the expected id', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                outfit: outfit.name
            })
        })
    })
    describe('invalid id', () => {
        let res, outfitToSearch
        test('send a response of 404 when the id does not exist', async (done) => {
            outfitToSearch = {
                items: [ '5e62236624e7a477dc120a82' ],
                id: '5e62236624e7a477dc120a83',
                name: 'Glamourous Dior Night Outfit'
            }
            res = await supertest(app).get(`/outfits/${outfitToSearch.id}`)
            expect(res.status).toBe(404)
            expect(res.body).toMatchObject({
                status: 'fail',
                message: `The outfit with the id: ${outfitToSearch.id} does not exist`
            })
            done()
        })
    })
})

describe('POST /signup', () => {
    let res

    beforeAll(async (done) => {
        res = await supertest(app).post('/signup').send({
            name: 'Tudor Tacal',
            email: 'tudor@domain.com',
            password: 'hjgvhgdcfdy36ere'
        })
        done()
    })
    test('send back a response of 201', () => {
        expect(res.status).toBe(201)
    })
    test('sends back an autorhisation token', () => {
        expect(typeof res.body.token).toBe('string')
    })
})

describe('POST /OutfitRental', () => {
    describe('creates a new item reservation with items inside', () => {
        let res, item, outfit, user, outfitId, userId, numOfOutfitRentalBefore, numOfOutfitRentalAfter, createdOutfitReservation

        beforeAll(async (done) => {
            const outfitRentalBefore = await OutfitRental.find({})
            numOfOutfitRentalBefore = outfitRentalBefore.length
            item = await Item.create({
                name: 'Skirt',
                size: 'S',
                collectionDate: 2019,
                colour: 'black',
                quantityInStock: 1
            })
            outfit = await Outfit.create({
                name: 'Glamourous Dior Night Outfit',
                items: [item._id]
            })
            user = await User.create({
                email: 'tudortatac@domain.com',
                password: 'jhgjg757'
            })

            outfitId = outfit.id
            userId = user.id

            res = await supertest(app).post('/outfitRental').send({
                userId: userId,
                outfitId: outfitId,
                rentalStartDate: '2020/02/10',
                rentalEndDate: '2020/02/12'
            })

            const outfitRentalAfter = await OutfitRental.find({})
            numOfOutfitRentalAfter = outfitRentalAfter.length
            done()
        })
        test('Responds with 201 when successful', () => {
            expect(res.status).toBe(201)
        })
        test('Returns the created outfitRental with the response', () => {
            expect(res.body).toMatchObject({
                status: 'success',
                data: {
                    outfitRental: {
                        userId: userId,
                        outfitId: outfitId,
                        rentalStartDate: '2020/02/10',
                        rentalEndDate: '2020/02/12'
                    }
                }
            })
            createdOutfitReservation = res.body.data.outfitRental
        })
        test('Only one outfitRental exists in the database', () => {
            expect(numOfOutfitRentalAfter).toEqual(numOfOutfitRentalBefore + 1)
        })
    })
})