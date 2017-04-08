var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// id_stock is the stock code like AAPL
var StockSchema = new Schema({
    id_stock:{
        type:String,
        required:true,
        unique:true,
    }
});

module.exports = mongoose.model('Stock', StockSchema);
