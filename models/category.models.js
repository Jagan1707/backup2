const mongoose = require('mongoose');
const crypto = require('crypto');


const categorySchema = mongoose.Schema({
    uuid : {type:String,require:false},
    Image : {type:String,require:true},
    Category : {type:String,require:true},
    Subcategory : {type:String,require:true},
    AdminId : {type:String,require:true}
},{
    timestamps:true
})
    

categorySchema.pre('save',function(next){
    this.uuid = "SEC"+crypto.pseudoRandomBytes(4).toString('hex').toUpperCase();
    next();
})

module.exports = mongoose.model('category',categorySchema)
