const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [mongoose.Schema.Types.ObjectId]
})

const outfitModel = mongoose.model('Outfit', outfitSchema)

module.exports = outfitModel;