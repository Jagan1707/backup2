const nodemailer = require('nodemailer');
const sendGrid = require('@sendgrid/mail');
const ejs = require('ejs');
const {join} = require('path')
require('dotenv').config();


//sendGrid.setApiKey(process.env.SG)
console.log(process.env.SG);
const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'peakyblinders1tommy@gmail.com',
        pass:'tommy12345s'
    }
})



async function mailsending(maildata){
    try{
        console.log('success')

        let data = await ejs.renderFile(join(__dirname,'../temp',maildata.fileName),maildata,maildata.details)

        const mailDetails = {
            from : maildata.from,
            to : maildata.to,
            subject : maildata.subject,
            //text : maildata.text,
            //attachments : mailData.attachments,
            html : data
        }
        transport.sendMail(mailDetails,(err,data)=>{
        //sendGrid.send(mailDetails,(err,data)=>{
            if(data){
                console.log("mail is sended");
            }else{
                console.log("mail not sended")
            }
        })
    }catch(err){
        console.log(err.message)
    }
}



module.exports = {
    mailsending
}