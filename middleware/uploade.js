const multer = require('multer');

const store = multer.diskStorage({
    destination:(req, file, next)=>{
        next(null,'./upload/') 
        console.log('path');
    },
    filename: (req, file, next)=>{
        console.log("file name",file.originalname);
        next(null,`${file.originalname}`);
    }
})


module.exports = {store}