var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var database = require('./database');
var Item = require('./models/Items/Item.model');
var Outfit = require('./models/Outfits/Outfit.model');
var User = require('./models/Users/User.model');
var OutfitRental = require('./models/OutfitRental/OutfitRental.model')
const mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/items', async (req, res, next) => {
  const items = await Item.find({}, { lean: true })
  res.status(200).json({
    status: 'success',
    data: {
      items: items.map(item => item._id)
    }
  })
})

app.get('/outfits/:id', async (req, res, next) => {
  const outfit = await Outfit.findById(req.params.id)

  if(outfit) {
    res.status(200).json({
      status: 'success',
      outfit: outfit.name
    })
  } else {
    res.status(404).json({
      status: 'fail',
      message: `The outfit with the id: ${req.params.id} does not exist`
    })
  }
})
app.delete('/items/:id', async (req, res, next) => {
  try{
    const { id } = req.params
    // const item = await Item.findById(req.params.id)
    await Item.deleteOne({ id })
    console.log('jgvkg')
    res.status(200).json({
      status: 'success',
      message: `Item ${ id } has been deleted`
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid item'
    })
  }
})

app.get('/items/:id', async (req, res, next) => {
  const item = await Item.findById(req.params.id)
  if(item) {
    res.status(200).json({
      status: 'success',
      item: item.name
    })
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The item was not found'
    })
  }
})

app.get('/signin', async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if(userExists){
    if( await user.comparePassword(password)) {
      res.status(200).json({
        status: 'success',
        data: {
          username: user.username
        },
        token
      })
    } else {
      req.status(404).json({
        status: 'fail',
        message: 'Unvalid information provided'
      })
    }
  } else {
      req.status(404).json({
        status: 'fail',
        message: 'Unvalid information provided'
      })
    }

  const token = user.generateAuthToken()
  res.status(201).json({
    status: 'success',
    token
  })
}) 
//

app.post('/items', async (req, res, next) => {
  try{
    const { name, size, collectionDate, colour, quantityInStock } = req.body
    const createdItem = await Item.create({ name, size, collectionDate, colour, quantityInStock })

    res.status(201).json({
      status: 'success',
      data: {
        createdItem
      }
    })
  }catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid item'
    })
  }
})

app.post('/outfits', async(req, res, next) => {
  
    const { name, items } = req.body
    const createItems = items.map(async (itemDefinition) => {
      return await Item.create(itemDefinition)
    })
    const createdItems = await Promise.all(createItems)
    const createdOutfit = await Outfit.create({
      name,
      items: createdItems.map(item => item._id)
    })
    res.status(201).json({
      status: 'success',
      data: {
        outfit: createdOutfit
      }
    })
})

app.get('/outfits', async (req, res, next) => {
  const outfits = await Outfit.find({}, { lean: true })
  res.status(200).json({
    status: 'success',
    outfits: outfits.map(outfit => outfit._id)
  })
})

app.post('/signup', async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.create({ email, password})

  const token = user.generateAuthToken()
  res.status(201).json({
    status: 'success',
    token
  })
})

app.post('/outfitRental', async (req, res, next) => {
  const {userId, outfitId, rentalStartDate, rentalEndDate } = req.body
  const newOutfitRental = await OutfitRental.create({userId, outfitId, rentalStartDate, rentalEndDate})
  res.status(201).json({
    status: 'success',
    data: {
      outfitRental: newOutfitRental
    }
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
