const mongoose = require('mongoose');
const ItemModel = require('./Item.model');

describe('ItemModel', () => {
    beforeAll(async(done) => {
        const url = 'mongodb://127.0.0.1/LuxuryOutfitRentalShop'
        await mongoose.connect(url, { useNewUrlParser: true })
        done()
    })
    describe('basic operations', () => {
        beforeAll(async (done) => {
            await ItemModel.deleteMany({})
            done()
        })
        test('Create a new entry', async (done) => {
            await ItemModel.create({
                name: 'Blouse',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 4
            })

            const allItems = await ItemModel.find({})
            expect(allItems).toHaveLength(1)
            done()
        })
        test('Create a new entry', async (done) => {
            await ItemModel.create({
                name: 'Jeans',
                size: 'S',
                collectionDate: 2019,
                colour: 'red',
                quantityInStock: 4
            })

            const allItems = await ItemModel.find({})
            expect(allItems).toHaveLength(2)
            done()
        })
    })
})