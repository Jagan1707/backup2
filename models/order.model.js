const mongoose = require('mongoose');
const crypto = require('crypto');



const orderSchema = mongoose.Schema({
    uuid : {type:String,require:false},
    userId : {type:String,require:true},
    products :[
        {
            productId : String,
            productName : String,
            ProductColor : String,
            productimg : String,
            quantity : Number,
            price : Number,
          
        },
    ],
    total : {type:String,require:false},
    address : {type:String, require:false},
    active : {type:String,require:false,default:true},
    status : {type:String, require:false}
},{
    timestamps:true
})




orderSchema.pre('save', function(next){
    this.uuid = "ORD"+crypto.pseudoRandomBytes(4).toString('hex').toUpperCase();
    next();
    console.log('uuid',this.uuid);
})

module.exports = mongoose.model('order',orderSchema);