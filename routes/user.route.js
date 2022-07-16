const router = require('express').Router()
const bcrypt = require('bcrypt');   
const userSchema = require('../models/user.model');
const elecSchema = require('../models/Electronics.model');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const multer = require('multer');
const xlsx = require('xlsx')
const {totp} = require('otplib');
const sms = require('fast-two-sms');
const mail = require('../middleware/mail');
const {joiVal} = require('../models/validation');
const file = require('../middleware/uploade');
const { updateOne } = require('../models/user.model');

totp.options={ digits : 4 };

const upload = multer({storage : file.store});


//new user register
router.post('/register',async(req,res)=>{
    try{
       // const joi = await joiVal.validateAsync(req.body);
        bcrypt.hash(req.body.password,10,function(err,hasscode){
            if(err){
                res.json({'err':err.message})
            }
           
            let user = new userSchema({
                name : req.body.name,
                email : req.body.email,
                phone : req.body.phone,
                password : hasscode,
                address : req.body.address,
                role:req.body.role
            })
             user.save()
             .then(user=>{
                let toMail = user.email
                let subject = "verufy mail"
               // let text = req.body.text
                let mailData={
                    from:'peakyblinders1tommy@gmail.com',
                    //from:'jagan.platosys@gmail.com',
                    to:toMail,
                    subject:subject,
                    //text:text,
                    fileName : 'temp.ejs',
                    details :{
                        uuid:user.uuid
                    }
                }
                let data = mail.mailsending(mailData); 
                res.json({status:'success',message:'user register successfull!','result':user})
               

                console.log("succussful",user)
                
             })
                
            })
    }catch(err){
        res.json({status:'failure',message:err.message})
    }
})

router.get('/:uuid',async(req,res)=>{
try{

    await userSchema.findOneAndUpdate({uuid:req.params.uuid},{active:true}).then(data=>{
        console.log('success');
        res.send(`<center><h1>WELLCOME<h1>
        <img src ="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgX0TDHxP1NkHDATsBbYwCpd0p3O4bMmvxrw&usqp=CAU",width="250" height="250">
        <p>your account is activeted</p></center>
        `)
    })
}catch(err){
res.json({"error":err.message})
}
});




//user login
router.post('/login',async(req,res)=>{
try{
    var name = req.body.name
    var password = req.body.password 
    console.log(name);
  userSchema.findOne({$or:[{email:name},{phone:name}]}).then(user=>{
      console.log(user);
      if(user){
        bcrypt.compare(password,user.password,function(err,result){
            if(err){
                res.json({'error':err.message});
            }
            if(result){
                const token = jwt.sign({uuid:user.uuid},'key',{expiresIn:'1d'}) 

               res.json({status:'success',message:'login successfull!','data':user,token})
         
                
            }else{
              res.json({message:'password does not match!'})
              
         
            }
        })
    }else{
          res.json({status:'failure',message:'username not found!'})
         
    }
    })
    const time = moment().toDate() 
    await userSchema.findOneAndUpdate({$or:[{email:name},{phone:name}]},{latestVisted:time,loginStatus:true})
     }catch(err){
         res.json({'error':err.message})
        }
    });




// user logout
router.post('/logout',async(req,res)=>{
    try{
        const time = moment().toDate()
        const data = await userSchema.findOneAndUpdate({uuid:req.query.uuid},{latestVisted:time,loginStatus:false})
        return res.json({ststus:'success',message:'logout successfull!','loginstatus':data.loginStatus,'latestvisited':data.latestVisted})
    }catch(err){
        res.json({'error':err.message})
    }
});

// forget password
router.post('/forgetPassword',async(req,res)=>{
try{
 const name = req.body.name
    const sec = 'key'
    const digit = totp.generate(sec);
    console.log(digit)
    
    let msg ={
        authorization:'Lu5S9YzUDGRk8WoykwrbFsW1SyCKP40eOqSYIHWMHZRgsFcn4exrDBSW9Thl',
        message : 'your reset password otp :'+digit,
        numbers : ["7358310254"]
        }
        sms.sendMessage(msg).then(result=>{
            console.log(result)
        }).catch(err=>{
            console.log(err)
        })
        userSchema.findOneAndUpdate({name:name},{otp:digit},{new:true}).exec();
        return res.json({status:'success',message:'yuour requested forgetPassword successfull! otp sended..',})
}catch(err){
    res.json({message:err.message})
}
})



//user reset password
router.post('/resetPassword',async(req,res)=>{
    try{

        bcrypt.hash(req.body.newPass,10,function(err,hasscode){
            if(err){
                console.log(err.message);
            }
            const otp = req.body.otp
            const newPass = hasscode
            console.log(newPass);
            const update = userSchema.findOneAndUpdate({otp:otp},{password:newPass},{new:true}).exec()
            if(update){
                res.json({message:'successfull'})
            }else{
                res.json({message:"faliure"});
            }
        })


        
    }catch(err){
        res.json({'error':err.message})
    }
})


router.post('/update-user',async(req,res)=>{
    try{
        const uuid = req.query.uuid
        await userSchema.findOneAndUpdate({uuid:uuid},req.body,{new:true}).exec().then(data=>{
            res.json({status:'success',message:'updated is successfull!',"result":data})
        })
    }catch(err){
        res.json({"error":err.message})
    }
})


router.post('/fileUpload',upload.single('sheet'),async(req, res)=>{
    try{
        let path = './upload/' + req.file.filename
        console.log(path);
        let exelfile = xlsx.readFile(path);
        let data = exelfile.SheetNames
        let result = xlsx.utils.sheet_to_json(exelfile.Sheets[data]);
       // console.log(result);
        //console.log(data);

        for (let data of result){
            
           let product= await elecSchema.findOne({Brand:data.Brand})
           const total = product.quantity + data.quantity;
           if(product){
            elecSchema.findOneAndUpdate({Brand:data.Brand},{quantity:total},{new:true}).exec();
           // elecSchema.updateOne({quantity:total},{new:true}).exec();    
           }else{
            const additems = new elecSchema(data)
            const save = await additems.save();
            console.log(save);
           }
        }

        res.json({status:'success',message:'file uploaded succussfull'});
    }catch(err){
        res.json({'error':err.message})
    }
})







// router.post('/mail',async(req,res)=>{
//     try{
//         let toMail = req.body.toMail
//         let subject = req.body.subject
//        // let text = req.body.text
//         let mailData={
//             from:'peakyblinders1tommy@gmail.com',
//             //from:'jagan.platosys@gmail.com',
//             to:toMail,
//             subject:subject,
//             //text:text,
//             fileName : 'temp.ejs',
//         }
//         let data = await mail.mailsending(mailData);
//         res.json({status:'success',message:'mailsend successfully'})
//     }catch(err){

//     }
// })


module.exports= router
