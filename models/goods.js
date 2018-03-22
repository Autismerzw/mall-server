var mongoose = require('mongoose')
var Schema = mongoose.Schema;
// console.log(Schema)
var productSchema = new Schema(
    {
        "productId"     : String,
        "productName"   : String,
        "salePrice"     : Number,
        "productImage"  : String,
        "productNum"    : Number,
        "checked"    : Number,
    }
);

module.exports = mongoose.model('Good', productSchema);