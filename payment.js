const braintree = require('braintree');
const paypal = require('paypal-rest-sdk');
const app = require('express').Router()
     



//paypal payment

app.get('/',(req,res)=>{
    res.send(`<center><img src="https://store-cdn.arduino.cc/uni/wysiwyg/Payment_Options.jpg">
    <h1>Welcome to payment Site</h1>
    <h2>click to buy your product</h2>
    <form action ="pay/paypal" method="post">
    <input type= "submit" value="PAY" style="color:red;background-color:pink ;" >
    </form></center>`)
})


paypal.configure({
    'mode':'sandbox',
    'client_id':'AaEqhHRzmyY7C-XmgDA4ssy1euWD85yiBhhCIlcHzJXT1wWaOQkxQy0BxoITaV-VPUn_Xljz3o6gV3nm',
    'client_secret':'EB0Q8s9a-sZrjKU0MizQ-pr8UOyyOy0OG02NrwZTWjMCZsYFZ50TW4auS7F4sgyCBFKzEvodNE87wJjo'
})


app.post('/paypal', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:7000/pay/success",
          "cancel_url": "http://localhost:7000/pay/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": " Hp LAPTOP",
                  "price": "5.00",
                  "currency": "USD",
                  "quantity": 1
              },
            {
                "name":"Lenovo LAPTOP",
                "price":"5.00",
                "currency":"USD",
                "quantity":1
            }]
          },
          "amount": {
              "currency": "USD",
              "total": "10.00"
          },
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
      console.log("payment",payment);
    if (error) {
        throw error;
    } else {
        console.log("payment.links",payment.links)
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    console.log("payerID",payerId);
    const paymentId = req.query.paymentId;
    console.log("paymentID",paymentId);
   
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "10.00"
          }
      }]
    };
   
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send(`<img src="https://www.indiaesevakendra.in/wp-content/uploads/2020/08/Paymentsuccessful21.png">`);
      }
  });
  });
  app.get('/cancel', (req, res) => res.send(`<img src="https://www.pngkey.com/png/full/196-1960095_cancelled-payment-payment-cancelled.png">`));






  //braintree payment method


const gateway = new braintree.BraintreeGateway({

    environment: braintree.Environment.Sandbox,
    merchantId:"mfkfhxyjgwvgsmg8",
    publicKey:"qpsscwdpd5kmz8d2",
    privateKey:"befdc5c3b10b32cb713af1398e5496e7"
});

app.get('/token',async(req,res)=>{
try{
    gateway.clientToken.generate({},(err,resToken)=>{
        if(err){
            res.send(err)
        }else{
            console.log(resToken)
            res.send(resToken)
        }
    })
}catch(err){
    res.json(err.message)
}
})

    app.post("/transfer",(req,res)=>{
        try{
            const payment = gateway.transaction.sale({
               "amount":req.body.amount,
               "paymentMethodNonce":req.body.paymentMethodNonce,
               "deviceData":req.body.deviceData,
               "options":{
                   submitForSettlement:true
               }
            },(err,resdata)=>{
                if(resdata.success){
                    res.json({status:'success',message:resdata.transaction })
                }else{
                    res.json({'err':err.message})
                }
            })
        }catch(err){
            res.json({status:"failure",message:err.message})
        }
    })



module.exports=app

