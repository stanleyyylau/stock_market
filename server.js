var mongoose = require('mongoose');
var app = require('express')();
var Stock = require('./stock');
var moment = require('moment');
var yahooFinance = require('yahoo-finance');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/stock_market");

var server = require('http').Server(app);

var io = require('socket.io')(server);

io.on('connection', function(socket) {
    socket.on('client event', function(data) {
        console.log(data)
        var nome = data.value;
        var newStock = new Stock();
        newStock.id_stock = nome;
        newStock.save(function(err) {
            if (err) throw err;
        })
        io.emit('update label', data);
    });
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

server.listen(8080, function(){
  console.log('running on port 8080')
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});

// Returns all stock symbol, but not yahoo api data
app.get('/stocks', function(req, res) {
    Stock.find({}, function(err, data) {
        if (err) throw (err);
        res.send(data);
    });
})

// Given a stock symbol, return the yahoo api data
app.get('/stocks/:id', function(req, res) {
    var yahooFinance = require('yahoo-finance');
    var now = moment().format("YYYY-MM-D");
    var now7 = moment().subtract(7, 'days').format("YYYY-MM-D");
    yahooFinance.historical({
        symbol: req.params.id,
        from: now7,
        to: now,
    }, function(err, quotes) {
        if (err) res.send("Errore" + err);
        if (quotes.length > 0) {
            res.send(quotes);
        } else {
            res.send("Code not valid");
        }
    })
})


app.get('/infostocks', function(req, res) {
    Stock.find({}, function(err, data) {
        if (err) throw (err);
        var result = [];
        result[0] = (data);
        var i = 0;
        var count = 0;
        for (let i = 0; i < data.length; i++) {
            (function(i) {
                var now = moment().format("YYYY-MM-D");
                var now7 = moment().subtract(7, 'days').format("YYYY-MM-D");
                yahooFinance.historical({
                    symbol: data[i].id_stock,
                    from: now7,
                    to: now,
                }, function(err, quotes) {
                    count++;
                    result[i + 1] = quotes;
                    if (count == data.length) {
                        res.send(result);
                    }
                })
            })(i);
        }
    });
})
