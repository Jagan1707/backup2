const fcm = require('fcm-notification');
const Key = require('../ecommerce-65422-firebase-adminsdk-omzzk-51a217c248.json');

const notifi = new fcm(Key);

async function sendNotifi(message,req,res){
try{
    const message ={
        Notification:{
            tittle : message.tittle,
            message:message.message,
            body : message.bodyMsg
        },
        token : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiVVNFNEVCRDQ0RDQ3Q0E0IiwiaWF0IjoxNjUxMzkzMjAwLCJleHAiOjE2NTEzOTY4MDB9.WWNOHWxnL9wSSFnoM-oSySzj-BwoK6nPUB9OXBbhYHA"
    }

    const data = await notifi.send(message);
    if(data){
        console.log(data);
        res.json({status:'success',message:'notification sended success!'})
    }else{
        console.log(err.message);
        res.json({status:'failure',message:'notification not send'});
    }
}catch(err){
    res.json({'error':err.message})
}

}


module.exports = {
    sendNotifi
}