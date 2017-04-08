var mongoose = require('mongoose');
var express = require('express');
var app = express();
var moment = require('moment');
var yahooFinance = require('yahoo-finance');
var Stock = require('./stock');
var port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/stock_market");

app.use(express.static('public'))
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {
    // Client event is when a new stock code is added
    socket.on('client event', function(data) {
        console.log(data)

        var newStock = new Stock({
            id_stock: data.value
        })

        newStock.save(function(err) {
            if (err) throw err;
        })

        // Tell all clients a new stock id was added
        io.emit('update label', data);
    });

    // When someone deletes a stock code
    socket.on('client event2', function(data) {
        console.log(data)

        Stock.remove({
            id_stock: data.value
        }, function(err) {
            if (err) throw err;
        })

        io.emit('remove label', data);
    });
});

server.listen(port, function(){
  console.log(`running on port ${port}`)
});

// Returns all stock symbol, but not yahoo api data
app.get('/stocks', function(req, res) {

    Stock.find({})
    .then((data)=> {
        res.send(data)
    })
    .catch((err) => {
        res.send({
            errorCode: 1,
            errorMsg: "Can't retrieve data from database"
        })
    })
})

// Given a stock symbol, return the yahoo api data
app.get('/stocks/:id', function(req, res) {
    var yahooFinance = require('yahoo-finance');
    var currentDate = moment().format("YYYY-MM-DD").toString();
    var last7day = moment().subtract(7, 'days').format("YYYY-MM-DD").toString();
    yahooFinance.historical({
        symbol: req.params.id,
        from: last7day,
        to: currentDate,
    }, function(err, quotes) {
        if (err) res.send({
            errorCode: 1,
            errorMsg: "Something went wrong"
        });
        if (quotes.length > 0) {
            res.send(quotes);
        } else {
            res.send({
                errorCode: 1,
                errorMsg: "Code not valid."
            });
        }
    })
})

// Return all stocks in database and alongside with the data from Yahoo
app.get('/infostocks', function(req, res) {

    var stockCodeArray = [];
    var currentDate = moment().format("YYYY-MM-DD").toString();
    var last7day = moment().subtract(7, 'days').format("YYYY-MM-DD").toString();

    Stock.find({})
    .then((data) => {
        data.forEach((element) => {
            stockCodeArray.push(element.id_stock) 
        })

        yahooFinance.historical({
            symbols: stockCodeArray,
            from: last7day,
            to: currentDate,
        }, function(err, quotes) {
            if (err) {
                res.send({
                    errorCode: 1,
                    errorMsg: "Something went wrong"
                })
            }

            res.send(quotes)
        })

    })
    .catch((err) => {
        res.send({
            errorCode: 1,
            errorMsg: "Something went wrong"
        })
    })
    
})
