require('dotenv').config()
const twilio = require('twilio')(process.env.SID,process.env.TOKEN)


var digit = '0123456789';
let otp='' ;
for(let i=0;i<4;i++){
 otp += digit[ Math.floor(Math.random()*10)]
}
console.log('otp',otp)


       function twill(){
        try {
            twilio.messages.create({
                from:'+18455249480',
                to : "+919092484971",
                body : 'your reset password otp :' + otp
            }).then(sms=>{
                console.log("sms sended")
            }).catch(err=>{
                console.log('err',err.message)
            })
        } catch (err) {
            console.log(err.message)
        }
       }

        module.exports = {twill}