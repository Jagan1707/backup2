const router = require('express').Router();
const userSchema = require('../models/user.models');
require('dotenv').config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {totp} = require('otplib');
const moment = require('moment')
const {forgetmail,mailsending} = require('../middleware/mail') 
const { updateOne } = require('../models/user.models');
const sms = require('fast-two-sms');
const twillo = require('twilio')(process.env.SID,process.env.TOKEN)
const {authVerify,isAdmin} = require('../middleware/auth')


totp.options = { digits : 4 }


router.post('/Register',async(req,res)=>{
    try{
        let username = req.body.username
        let role  = req.body.role 
        let phone = req.body.phone
        let email = req.body. email 
        let address = req.body.address
        let loginType = req.body.loginType

    
        if(username){
            let nameData = await userSchema.findOne({"username":username}).exec();
            if(nameData){
                return res.status(400).json({'status':'failed', 'message':'user name already exist'})
            } 
        }else{
            return res.status(404).json({'status':'failed', 'message':'use another name'})
        }
    
        if(email){
            let emailData = await userSchema.findOne({'email':email}).exec();
            if(emailData){
                return res.status(400).json({"status":"failed", "message":"email id already exist"})
            }
        }else{
            return res.status(400).json({"status":"failed", "message":"use another Email id"})
        }
    
        if(phone){
            let numberData = await userSchema.findOne({"phone":phone}).exec();
            if(numberData){
                return res.status(400).json({"status":"failed", "message":"mobile number already exist"})
            }
        }else{
            return res.status(400).json({"status":"failed", "message":"use another Number"})
        }
        bcrypt.hash(req.body.password,10,function(err,hashcode){
            if(err){
                console.log("err",err.message)
            }
            console.log('done')
            let userData = new userSchema({
                username : username,
                role     : role,
                phone    : phone,
                email    : email,
                password : hashcode,
                address  : address,
                loginType : loginType
            })

            console.log('name',userData.username);
            
            userData.save().then(data=>{
                let toMail = data.email
                let subject = "verify mail"
                let text = "hello "+data.username+" welcome"
                
                let mailDetails = {
                   //from : 'peakyblinders1tommy@gmail.com',
                    from : "jagan.platosys@gmail.com",
                    to   : toMail,
                    subject : subject,
                    //text : text,
                    filenNme : 'mail.ejs',
                    details :{
                        uuid:data.uuid,
                        name : data.username
                    }
                }
             let detail = mailsending(mailDetails);

             res.json({status:"success",message:"successfully register","result":data})
            })

        })
    }catch(err){
        console.log(err.message)
        res.json({'err':err.message})
    }
})

router.get('/Active:uuid',async(req,res)=>{
    try{
        await userSchema.findOneAndUpdate({uuid:req.params.uuid},{active:true}).then(data=>{
            console.log('success');
            res.send(`<center>
            <h1>Hello ${data.username} welcome</h1>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgX0TDHxP1NkHDATsBbYwCpd0p3O4bMmvxrw&usqp=CAU",width="250" height="250" />
            <h3>your account is activated</h3>
            <center/>`)
        })
    }catch(err){
        res.json({"err":err.message})
    }
 })


router.post('/Login',async(req,res)=>{
    try{
        let username = req.body.username
        let password = req.body.password
        const time = moment().toDate() 
         await userSchema.findOneAndUpdate({$or:[{phone:username},{email:username}]},{latestVisted:time,loginStatus:true}).then(data=>{
            bcrypt.compare(password,data.password,function(err,result){
                if(err){
                    res.json({"err":err.message})
                }
                if(result){
                   
                    const token = jwt.sign({uuid:data.uuid},"key",{expiresIn:'1d'}) 
                   
                    res.json({status:'success',"result":data,token})
                }else{
                   
                    res.json({status:'failure',message:'psssword is not matched!'})
                }
            })
         }).catch(err=>{
            res.json({status:'failure',message:'username not found please sign-up'})
        })

    }catch(err){
        console.log(err.message)
        res.json({'err':err.message})
    }
})


router.post('/Logout',async(req,res)=>{
    try {
        const uuid = req.query.uuid
        await userSchema.findOneAndUpdate({uuid:uuid},{loginStatus:false},{new:true}).then(result=>{
            res.json({status:"success",message:'Logout successfull!','loginstatus':result.loginStatus})
        }).catch(err=>{
            console.log(err.message)
            res.json({"err":err.message})
        })
    } catch (err) {
        res.json({"err":err.message})
    }
})

router.post('/forgetPassword',async(req,res)=>{
 try{
    const mail = req.query.mail;
    const sec = '5021';
    const digit = totp.generate(sec);
    console.log(digit);
    await userSchema.findOneAndUpdate({email:mail},{otp:digit},{new:true}).then(result=>{
        twillo.messages.create({
            from:'+18455249480',
            to : "+919092484971",
            body : 'your reset password otp :' + digit
        }).then(mms=>{
            console.log("sms sended")
        }).catch(err=>{
            console.log('err',err.message)
        })
                let toMail = result.email
                 let subject = "password-forgetmail"
                 let text = `Hello Your change password otp is : ${digit}`
                 let mailData = {
                    from : 'jagan.platosys@gmail.com',
                    //from : 'peakyblinders1tommy@gmail.com',
                    to : toMail,
                    subject : subject ,
                    text : text
                 }

                forgetmail(mailData)
                console.log(mail)
         res.json({status:'success',message:'send otp your mail'})        
                 
    }).catch(err=>{
        console.log('mail address not valid')
        res.json({"err":err.message})
    })
 }catch(err){
    console.log(err.message)
    res.json({"err":err.message})
 }
})

router.post('/resetPassword',async(req,res)=>{
    try{
        bcrypt.hash(req.query.newPass,10,function(err,hashcode){
            if(err){
                console.log(err.message)
            }
            const otp = req.query.otp
            const newPass = hashcode
            if(!otp){
                res.json({status:"failure",message:"input otp and password"})
            }else{
            console.log("pass",newPass)
         userSchema.findOneAndUpdate({otp:otp},{password:newPass},{new:true}).then(result=>{
           res.json({status:"success",message:"password successfully reseted!"})
           console.log("password successfully reseted!"); 
         }).catch(err=>{
            res.json({status:"failure",message:err.message})
         })
        }
        })

    }catch(err){
        res.json({"err":err.message})
    }
})



router.put('/update',async(req,res)=>{
    try{
        const email = req.body.email;
        let phone = req.body.phone
        await userSchema.findOneAndUpdate({email:email},{phone:phone},{new:true}).then(result=>{
            res.json({status:'success',message:'mobile number successfully updated!','result':result})
        }).catch(err=>{
            console.log(err.message)
            res.json({'err':err.message})
        })
    }catch(err){
        res.json({'err':err.message})
    }   
})

router.put('/updateAdd',async(req,res)=>{
    try{
        const uuid = req.body.uuid;
        let address = req.body.address
        await userSchema.findOneAndUpdate({uuid:uuid},{address:address},{new:true}).then(result=>{
            res.json({status:'success',message:'address successfully updated!','result':result})
        }).catch(err=>{
            console.log(err.message)
            res.json({'err':err.message})
        })
    }catch(err){
        res.json({'err':err.message})
    }   
})

router.put('/updateuser',async(req,res)=>{
    try{
        const uuid = req.body.uuid;
        await userSchema.findOneAndUpdate({uuid:uuid},req.body,{new:true}).then(result=>{
            res.json({status:'success',message:'userdetail successfully updated!','result':result})
        }).catch(err=>{
            console.log(err.message)
            res.json({'err':err.message})
        })
    }catch(err){
        res.json({'err':err.message})
    }   
})



router.post('/sms',async(req,res)=>{
    try {
        const number = req.body.number
        const text = req.body.text
        twillo.messages.create({
            from : '+18455249480',
            to : "+91" + number ,
            body : text
        }).then(ress=>{
            console.log('sended')
            res.json({status:'success',message:'sms successfully sended!'})
 
        }).catch(err=>{
            console.log('err',err.message)
            res.json({"err0":err.message})
        })
    } catch (err) {
        res.json({'err1':err.message})
    }
})

router.get('/getuserList',isAdmin,async(req,res)=>{
    try{
        await userSchema.find().exec().then(list=>{
            res.json({status:'success',"result":list})
            if(list.length == 0){
                res.json({status:'failure',message:'user list is empty'})
            }
        }).catch(err=>{
            console.log("err",err.message)
        })
    }catch(err){
        res.json({"err":err.message})
    }

  
})


router.get('/getoneUser',async(req,res)=>{
    try{
        let uuid = req.query.uuid
        await userSchema.findOne({uuid:uuid}).exec().then(list=>{
            res.json({status:'success',"result":list})
            if(list.length == 0){
                res.json({status:'failure',message:'user list is empty'})
            }
        }).catch(err=>{
            console.log("err",err.message)
        })
    }catch(err){
        res.json({"err":err.message})
    }
})


router.post('/contact',async(req,res)=>{
    try {
        let toMail = req.body.toMail
        let subject = "User Query"
        let name = req.body.name
        let text =  req.body.text
        let mailData = {
           from : 'jagan.platosys@gmail.com',
           //from : 'peakyblinders1tommy@gmail.com',
           to : toMail,
           subject : subject ,
           text : `hello , ${name} ` + text
        }

       forgetmail(mailData).then(contact =>{
        console.log("contact",contact)
        res.json({status:'success',message : 'query sended to admin',"result":contact})
       }).catch(err=>{
        console.log('err',err.message)
       })
    } catch (err) {
        res.json({"err":err.message})
    }  
})


module.exports = router