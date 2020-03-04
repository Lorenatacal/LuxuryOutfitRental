var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var database = require('./database');
var Item = require('./models/Items/Item.model')

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

const items = {
  bv45ft: 'Blouse',
  fg67at: "Skirt"
}

app.get('/items', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      items
    }
  })
})

app.get('/items/:id', (req, res, next) => {
  const { id } = req.params
  const doesItemExist = database.items[id]

  if(doesItemExist) {
    res.status(200).json({
      status: 'success',
      data: {
        items: database.items[id]
      }
    })
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The item was not found'
    })
  }
})

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

app.delete('/items/:id', (req, res, next) => {
  try{
    const { id } = req.params
    delete database.items[id]
    res.status(200).json({
      status: 'success',
      message: `Item ${id} has been deleted`
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid item'
    })
  }
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
