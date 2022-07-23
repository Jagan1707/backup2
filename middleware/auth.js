const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/user.models');
require('dotenv').config();

console.log(process.env.Verify)

function authVerify(req,res,next){
    try {
        let token = req.header('token');
        console.log(token);
        if(!token){
            res.json({status:'failure',message : "Unauthorized token"});
        }
        const decode = jwt.verify(token,process.env.Verify);
        console.log("decode",decode);
        next();
    } catch (err) {
        res.json({status:'failure',message:err.message})
    }
}



function isAdmin(req,res,next){
    try {
        let token = req.header("token");
        console.log(token);
        if(!token){
            res.json({status:'failure',message:"Unauthorized token"})
        }
        const decode = jwt.verify(token,process.env.Verify);
        console.log('token verify');
        console.log(decode.uuid);
        userSchema.findOne({uuid:decode.uuid}).exec().then(data=>{

            if(data.role == 'admin') {
                console.log('yes is Admin')
                next();
            }else{
                res.json({status:'failure',message:'Invalid token'})
            }
        })
    } catch (err) {
        console.log("error",err.message);
        res.json({status:'failure',message:err.message})
    }
}

module.exports = {
    authVerify,isAdmin
}