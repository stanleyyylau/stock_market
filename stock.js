var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
    id_stock:{
        type:String,
        required:true,
        unique:true,
    }
});

module.exports = mongoose.model('Stock', StockSchema);
