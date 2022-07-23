const express = require('express')
const cors = require('cors')
const app = express();
require('dotenv').config();
const braintree = require('braintree');

const config = {
    environment : braintree.Environment.Sandbox,
    merchantId: 'mfkfhxyjgwvgsmg8',
    publicKey: 'qpsscwdpd5kmz8d2',
    privateKey: 'befdc5c3b10b32cb713af1398e5496e7'
}

const gateway = new braintree.BraintreeGateway(config);


app.use(cors({origin:'http://localhost:3000'}));
app.use(express.json());

app.use(function(req,res,next){
    res.header('Access-Control-Allow-Orgin','*');
    res.header('Access-control-Allow-Header',"X-Requested-With");
    next();
})

app.get("/tokengenete",async(req,res)=>{
    try {
        gateway.clientToken.generate({},(err,token)=>{
            if(err){
                res.send({res:err})
            }else{
                res.json({'status':'success',message:token.clientToken})
                console.log('sucess',token.clientToken)
            }
        })

    } catch (err) {
        res.json({'status':'failed',message:err.message})        
    }
});

app.post('/saleTransaction',async(req,res)=>{
    try {
        const payment = gateway.transaction.sale({
            amount : req.body.amount,
            paymentMethodNonce : req.body.paymentMethodNonce,
            options : {
                submitForSettlement : true
            }
        },
        (err,data)=>{
            if(err){
                console.log('err',err.message)

            }else{
                console.log('data',data);
            }
            if(data.success){
                res.json({'status':'success',message: data.transaction})
            }else{
                res.json({'err':err})
            }
        })
    } catch (err) {
        console.log('err',err.message);
        res.json({'err':err.message});
    }
})





app.listen(4000,()=>{
    console.log('successfully running the port 4000');
})

