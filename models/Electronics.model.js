const mongoose = require('mongoose');
const crypto = require('crypto');


const elecSchema = mongoose.Schema({
    uuid:{type:String,require:false},
    Brand:{type:String,require:true,trim:true},
    color:{type:String,require:true},
    cost:{type:Number,require:true},
    img:{type:String,require:true},
    quantity:{type:Number,require:true},
    desc:{type:String,require:true},
    adminUuid:{type:String,require:true},
    categoryUuid:{type:String,require:true}
},
{
    timestamps:true
});

const timestamps = new Date();
const date = timestamps.getDate()+timestamps.getMonth()+timestamps.getFullYear();
const time = timestamps.getHours()+timestamps.getMinutes()+timestamps.getSeconds();

elecSchema.pre('save',function(next){
    this.uuid = "Elec"+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()+date+time;
    next();
});


module.exports = mongoose.model('electronic',elecSchema);