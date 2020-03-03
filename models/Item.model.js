const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    size: String,
    collectionDate: Number,
    colour: String,
    quantityInStock: Number
})

// we are declaring an instance of trhe model
const ItemModel = mongoose.model('Item', itemSchema)

module.exports = ItemModel;