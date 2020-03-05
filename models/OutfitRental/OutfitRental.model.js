const mongoose = require('mongoose');

const outfitRentalSchema = new mongoose.Schema({
    userId: String,
    outfitId: String,
    rentalStartDate: String,
    rentalEndDate: String,
})

const OutfitRentalModel = mongoose.model('OutfitRental', outfitRentalSchema)

module.exports = OutfitRentalModel