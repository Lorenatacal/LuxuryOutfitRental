const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const UserSchema = new mongoose.Schema({
    userName: String,
    email: {
        type: String,
        required: true,
        validate: {
            validator: function() {
                return validator.default.isEmail(this.email)
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20
    }
})

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign(this.id, process.env.JWT_SECRET)
}

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel