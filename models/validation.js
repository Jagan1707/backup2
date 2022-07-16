const joi=require('joi')
//const { schema } = require('./user.model')

const joiVal = joi.object({
    name: joi.string().alphanum().min(4).required(),
    role:joi.string().required(),
    //email:joi.string().pattern(new RegExp(/^[A-Za-z]+[0-9]+@[A-Za-z]+$/)).required(),
    email:joi.string().email().required(),
    phone:joi.string().length(10).pattern(new RegExp(/^[0-9]+$/)).required(),
    password:joi.string().min(8).alphanum().required(), 
    address:joi.string().required()
})
module.exports={
    joiVal
}