const router = require('express').Router();
const productSchema = require('../models/product.model');
const categoryShema = require('../models/category.models')
const {authVerify,isAdmin} = require('../middleware/auth')


/*-----Products-------*/

// Add product in database
router.post('/addProduct',async(req,res)=>{
    try{
       const productData =  await new productSchema(req.body)
       const result = productData.save();
       if(result){
        res.json({status:'success',message:'Product Successfilly Added!',"result":productData})
       }else{
        res.json({status:'failure',message:'Product Not Added!'})
       }
    }catch(err){
        res.json({"err":err.message})
    }
})

// delete product from Database
router.delete('/Delete',isAdmin,async(req,res)=>{
    try{
        let uuid = req.query.uuid;
        await productSchema.findOneAndDelete(uuid).then(result=>{
            res.json({status:'success',message:'product successfully deleted!'})
        }).catch(err=>{
            console.log(err.message)
            res.json({"err":err.message})
        })
    }catch(err){
        res.json({"err":err.message})
    }
})

// update product 
router.put('/update',isAdmin,async(req,res)=>{
    try{
        const uuid = req.body.uuid;
        await productSchema.findOneAndUpdate({uuid:uuid},req.body,{new:true}).then(result=>{
            res.json({status:'success',message:'product successfully updated!','result':result})
        }).catch(err=>{
            console.log(err.message)
            res.json({'err':err.message})
        })
    }catch(err){
        res.json({'err':err.message})
    }   
})

//GetAll Product 
router.get('/getAll',async(req,res)=>{
    try{
        await productSchema.find().then(result=>{
            res.json({status:'success','result':result})
            console.log(result)
        }).catch(err=>{
            console.log(err.message)
            res.json({'err':err.message})          
        })
    }catch(err){
        res.json({'err':err.message})
    }
})
//find one product
router.get('/findOne',authVerify,async(req,res)=>{
    try{
        let uuid = req.body.uuid
        console.log(uuid)
        await productSchema.findOne({uuid:uuid}).exec().then(result=>{
            res.json({status:'success','result':result})
            console.log(result)
        }).catch(err=>{
            res.json({'err':err.message})  
        })
    }catch(err){
        
        res.json({'err':err.message})  
    }
})

/*-----Category-------*/

// add-category 
router.post('/addCategory',async(req,res)=>{
    try{
       const data = await new categoryShema(req.body);
       data.save().then(result=>{
        res.json({status:'success',"result":result})
       }).catch(err=>{
        console.log(err.message)
        res.json({'err':err.message})
       })
    }catch(err){
        res.json({"err":err.message})
    }
})

//delete-Category
router.delete('/deleteCategory',isAdmin,async(req,res)=>{
    try{
        let uuid = req.query.uuid
        await categoryShema.findOneAndDelete(uuid).then(result=>{
            res.json({status:'success',message:'deleted successfull!'})
        }).catch(err=>{
            res.json({'err':err.message})
        })
    }catch(err){
        res.json({"err":err.message})
    }
})

//update-category
router.put('/updatecategory',async(req,res)=>{
    try {
        const uuid = req.query.uuid
        await categoryShema.findOneAndUpdate({uuid:uuid},req.body,{new:true}).exec().then(result=>{
            res.json({status:'success',message:'update succcessfull!',"result":result})
        }).catch(err=>{
            res.json({'err':err.message})
        })
    } catch (err) {
        res.json({'err':err.message})
    }
})

// category-feched-product 
router.get('/categoryBassed',async(req,res)=>{
    try {
        
    const productFeched = await categoryShema.aggregate([
        {
            $lookup:{
                from:'products',
                localField : 'uuid',
                foreignField : 'CategoryId',
                as : 'product_Details'
            }

        },
        {
            $lookup : {
                from : 'users',
                localField : 'AdminId',
                foreignField : 'uuid',
                as : 'Admin_Details'
            }
        },
        {
            $sort:{category:-1}
        }
    ])
    if(productFeched){
        res.json({status:'success',message:'category bassed product','result':productFeched});
    }else{
        res.json({status:'failure',message:'products not feched'})
    }
    } catch (error) {
      res.json({"err":error.message});   
    }
})

//individual caytegory
router.post('/indiCategory',async(req,res)=>{
    try {
        const uuid = req.query.uuid
        const result = await productSchema.find({CategoryId:uuid}).exec()
        if(result.length ==  0){
            console.log('empty')
            res.json({status:'failure',"result":result})
        }else{
            res.json({status:'success',"result":result});
        }
           
    } catch (err) {
        res.json({"err":err.message})
    }
    })

router.get('/filterPrice',async(req,res)=>{
    try {
        let start = req.query.start;
        let end = req.query.end;
        let mini = parseInt(start);
        let max = parseInt(end)
        const productFilter = await productSchema.aggregate([
            {
                $match:{
                    $and:[
                        {price:{
                            $gte : mini,
                            $lte : max
                        },
                    },
                    ]
                }
            },
            {
                $sort:{price:1}
            },
       
        ])
 if(!productFilter){
    res.json({status:'failure',})
 }
 if(productFilter.length == 0){
    res.json({status:"failure",message:'somthing went wrong'})
 }else{
    res.json({status:'success',"result":productFilter})
 }

    } catch (err) {
        res.json({"err":err.message})
    }
})

router.get("/search",async(req,res)=>{
    try {
        console.log('----------')
        const product = await productSchema.find({Brandname : {$regex : req.query.Brandname ,$options:'i'}}).exec();
        if(product.length == 0){
            const all = await productSchema.find().exec()
            res.json({status:"failure",'result':all})
        }else{
            res.json({status:'success',"result":product})
        }
    } catch (err) {
        res.json({"err":err.message})        
    }
})




module.exports = router


