const mongoose = require('mongoose');
const crypto = require('crypto');
const { boolean } = require('joi');


const userSchema = mongoose.Schema({
    uuid:{type:String,require:false},
    name:{type:String,require:true,trim:true},
    role:{type: String, enum:['admin', 'user'], required:false,default:'user'},
    email:{type:String,require:true},
    phone:{type:String,require:true},
    active:{type:Boolean,require:false,default:false},
    password:{type:String,require:true},
    address:{type:String,require:false},
    latestVisted:{type:String,require:false},
    loginStatus:{type:Boolean,require:false},
    otp:{type:String,require:false}
    
},
{
    timestamps:true
});



userSchema.pre('save',function(next){
    this.uuid = "USE"+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase();
console.log(this.uuid);
    next();
});

module.exports = mongoose.model('user',userSchema);
