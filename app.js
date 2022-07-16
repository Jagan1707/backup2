const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); 
const user = require('./routes/user.route')
const Electronics = require('./routes/Electronic.route'); 
const { required } = require('joi');
const order = require('./routes/order');
const axios = require('axios')
const res = require('express/lib/response');
const payment = require('./payment');
const bodyParser=require('body-parser')




const app = express();
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("views"));



app.get('/',async(req,res)=>{
    console.log('success');
    res.json({status:'success'});
});

let dburl = process.env.DB

//DataBase Connection
mongoose.connect(dburl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(db =>{
    console.log('dataBase connected start.....')
}).catch(err=>{
    console.log(err.message);
    process.exit(1);
})

app.use('/api/v1',user)
app.use('/api/v2',Electronics)
app.use('/api/v3',order)
// app.use('/api/v4',cart)
app.use('/pay',payment)
app.set("view engine","ejs");   

// axios.get('http://192.168.29.77:3000').then((result)=>{
//     console.log("result",result.data)
// }).catch((err)=>{
//     console.log("err",err.message)
// })


app.get('/home',(req,res)=>{
    res.render("new.ejs")
})

app.get('/account',(req,res)=>{
    res.render('account.ejs')

})

app.get('/product',(req,res)=>{
    res.render('procduct.ejs')
})
app.get('/cart',(req,res)=>{
    res.render('cart.ejs')
})

//server connection
app.listen(7000,()=>{
    console.log('server started......')
})
