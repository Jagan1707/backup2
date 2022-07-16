const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const axios = require('axios')

let app = express();
app.use(cors());
 
let port = 3000

let db = 'mongodb://localhost:27017/sample'
mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(result=>{
    console.log('dataBase connected...')
}).catch(err=>{
    console.log(err.message)
    process.exit(1)
})


app.get('/',async(req,res)=>{
    console.log('sucess');
    res.json('hello api success');
})

axios.get('http://192.168.29.77:7000/').then(result=>{
    console.log("result",result.data);
}).catch(err=>{
    console.log("error",err.message);
})


app.listen(port,()=>{
    console.log('server started port '+port)
})