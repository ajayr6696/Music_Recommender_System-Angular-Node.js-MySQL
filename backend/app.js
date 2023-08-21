var express = require('express');
var logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');

var songsRouter = require('./routes/songs');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));
app.use(bodyParser.raw());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,Authorization,RefreshToken');
  next();
})
app.disable('etag');

app.use('/songs', songsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send({
    status: 404,
    message: "Invalid route"
  })
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});
// app.listen(3001, ()=>{
//   console.log("listening on 3001")
// })
module.exports = app;
