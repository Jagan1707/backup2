const mongoose = require('mongoose')
const crypto = require('crypto')


const productSchema = mongoose.Schema({
    uuid        : {type:String,require:false},
    id          :{type:String,require:false},
    Brandname   : {type:String,require:true},
    Producttype : {type:String,require:true},
    Framecolor  : {type:String,require:true},
    Frametype   : {type:String,require:true},
    Frameshape  : {type:String,require:true},
    Framesize   : {type:String,require:true},
    Material    : {type:String,require:true},
    Gender      : {type:String,require:false,default:'Unisex'},
    price       : {type:Number,require:true},
    Quantity    : {type:Number,require:true},
    Image       : {type:String,require:true},
    AdminId     : {type:String,require:false},
    CategoryId  : {type:String,require:false},
    

},{
    timpestamps:true
})


productSchema.pre('save',function(next){
    this.uuid = "LEN"+crypto.pseudoRandomBytes(4).toString('hex').toUpperCase();
    next();
})

module.exports = mongoose.model('Product',productSchema);