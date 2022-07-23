const router = require('express').Router();
const  orderSchema = require('../models/order.model');
const productSchema = require('../models/product.model');
const userSchema = require('../models/user.models')


router.post('/addToCart',async(req,res)=>{
    try{
        console.log('add to cart')
        const {productId,productName, ProductColor,productimg, quantity,price} = req.body
        const userId = req.query.userId
        const addCart = new orderSchema(req.body)
        let cart = await orderSchema.findOne({$and:[{userId:userId},{active:true}]}).exec();
        if(cart){
            let data = cart.products
            let item = data.findIndex(index=>index.productId==productId)
           console.log("items",item)
 
            if(item>-1){
                let NewItems = cart.products[item];
                console.log("new",NewItems);
                NewItems.quantity = quantity;
                cart.products[item] = NewItems; 
 
                NewItems.price = price * NewItems.quantity;
 
                let total = NewItems.price
                console.log(total);
             
            }else{
                cart.products.push({productId,productName, ProductColor,productimg,quantity,price});
            }
            cart = await cart.save();
            //console.log(cart);
            res.json({status:'success',"result":cart})
        }else{
            let NewCart = await orderSchema.create({userId,products:[{productId,productName, ProductColor,productimg,quantity,price}]})
            res.json({status:'success',message:'result',NewCart});
        }
    }catch(err){
        console.log(err.message);
        res.json({'err':err.message})
    }
 
 })

router.get('/Cart',async(req,res)=>{
    try{
        const uuid = req.query.uuid
        const quantity = req.query.quantity
        let data = await orderSchema.findOne({uuid:uuid})
        if(data){
            let result = data.products.length
            let total = data.products
            console.log(total[0].price);
            let totalPrice =0;
            for(let i = 0;i<result;i++){
             totalPrice += total[i].price
            
            }
            console.log("total",totalPrice);

            const updated = await orderSchema.findOneAndUpdate({uuid:uuid},{total:totalPrice},{new:true}).exec();
            if(updated){
                res.json({status:'success',updated})
            }
            
        }else{
            res.json({status:'failure'})
        }

        let userUuid = req.body.userUuid
      

       
    }catch(err){
        res.json({"err":err.message})
    }
})


router.get('/proced',async(req,res)=>{
    try{
        const uuid = req.body.uuid
        const address = req.body.address
        await userSchema.findOneAndUpdate({uuid:uuid},{address:address},{new:true}).exec().then(data=>{
             let address = data.address
           orderSchema.findOneAndUpdate({active:true},{status:'pending',address:address},{new:true}).exec().then(result=>{
            console.log(result.address);
            res.json({status:'success',message:'your order successed',result}) 
           })

        })
    }catch(err){
        res.json({'err':err.message})
    }
})

router.get('/cancel',async(req,res)=>{
    try{
        const uuid = req.query.uuid
        await orderSchema.findOneAndUpdate({uuid:uuid},{status:'cancelled',active:false},{new:true}).exec().then(data=>{          
               res.json({status:'success',message:'order is cancelled',"result":data})  
    }).catch(err=>{
            res.json({message:err.message})
        })
    }catch(err){
        console.log(err.message);
        res.json({'error':err.message})
    }
})



router.get('/get-cancelOrder',async(req,res)=>{
    try{
        await orderSchema.find({active:false}).then(data=>{
            res.json({status:'success',message:'All are cancel orders',data})
        })
    }catch(err){
        res.json({"error":err.message})
    }
})

router.get("/delete", async (req, res) => {
    try {
      const uuid = req.query.uuid
    await orderSchema.findOne(products.productId =uuid).then(result=>{
        res.json({"result":result}); 
    })
    } catch (err) {
      res.json(err);
    }
  });

  router.post('/dele',async(req,res)=>{
    try{
        console.log('add to cart')
        const userId = req.query.userId
        const productId = req.query.productId
        let cart = await orderSchema.findOne({$and:[{userId:userId},{active:true}]}).exec();
        if(cart){
            let data = cart.products
            let item = data.findIndex(index=>index.productId==productId)
            console.log("items",item)
            console.log("length",data.length);
            
            let id = data[item].productId
            
            data[item].splice(item,1);
            console.log("len",data.length);

            // if(item>-1){
            //     let NewItems = cart.products[item];
            //     console.log("new",NewItems);
            // }
            
            res.json({status:'success',})
        }
    }catch(err){
        console.log(err.message);
        res.json({'err':err.message})
    }
 
 })




  router.get('/getcart',async(req,res)=>{
try{
    const uuid = req.query.uuid
    const result = await orderSchema.findOne({userId:uuid})
    if(result){    
    res.json({status:'success',"updated":result})
    }else{
        console.log("err")
    }

}catch(err){
    res.json({status:"failure","err":err.message})
}
  })

//   router.get('/total',async(req,res)=>{
//     try{
//         const uuid = req.query.uuid
//         const id = req.query.id
//         const qnt = req.query.qnt
//         let data = await orderSchema.findOne({uuid:uuid})
//         let arr = data.products
//         for(let i of arr){
//             console.log(i.productId)
//              if(i.productId == id){
//                 i.quantity = qnt
//                 //console.log("2",i.quantity)

//              }
//              console.log("3",i.productId,i.quantity)


//         }
        
        
//         // let data = await orderSchema.findOne({uuid:uuid})
//         // if(data){
//         //     let result = data.products.length
//         //     let total = data.products
//         //     console.log(total[0].price);
//         //     let totalPrice =0;
//         //     for(let i = 0;i<result;i++){
//         //      totalPrice += total[i].price
            
//         //     }
//         //     console.log("total",totalPrice);

//         //     const updated = await orderSchema.findOneAndUpdate({uuid:uuid},{total:totalPrice},{new:true}).exec();
//         //     if(updated){
//         //         res.json({status:'success',updated})
//         //     }
            
//         // }else{
//         //     res.json({status:'failure'})
//         // }

      
      

       
//     }catch(err){
//         res.json({"err":err.message})
//     }
// })



  module.exports = router


