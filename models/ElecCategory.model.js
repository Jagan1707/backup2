const mongoose = require('mongoose');
const crybto = require('crypto');

const categorySchema = mongoose.Schema({
    uuid : {type:String,require:false},
    category : {type:String,require:true},
    desc : {type:String,require:true},
    adminUUid : {type:String,require:true},
},{
    timestamps:true
})


categorySchema.pre('save',function(next){
    this.uuid = 'CAT'+crybto.pseudoRandomBytes(6).toString('hex').toUpperCase();
    next();
})


module.exports = mongoose.model('category',categorySchema);