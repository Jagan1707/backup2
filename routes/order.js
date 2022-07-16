const elecSchema = require('../models/Electronics.model');
const userSchema = require('../models/user.model')
const Cart = require('../models/cart.model');
const router = require('express').Router();


router.get('/getAll',async(req,res)=>{
     try{
        const items = elecSchema.find().then(data=>{
            res.json({status:"success",data})
        }).catch(err=>{
            res.json({status:'failure'})
        })
     }catch(err){
         res.json({})
     }

})
router.get('/search', async(req,res)=>{
    try{
        const data = await elecSchema.find({ Brand : {$regex: req.query.Brand, $options:"i"}}).exec();
        if(data){
            res.json({status:'success',data});
        } else{
            res.json({status:'filure'});   
        }
    }catch(err){
        res.json({'err':err.message})
    }
    })

router.post('/addToCart',async(req,res)=>{
   try{
       const {itemsUuid, quantity,cost} = req.body
       const userUuid = req.query.userUuid
       const addCart = new Cart(req.body)
       let cart = await Cart.findOne({$and:[{userUuid:userUuid},{active:true}]}).exec();
       if(cart){
           let data = cart.items
           let item = data.findIndex(index=>index.itemsUuid==itemsUuid)
          console.log("items",item)

           if(item>-1){
               let NewItems = cart.items[item];
               console.log("new",NewItems);
               NewItems.quantity = quantity;
               cart.items[item] = NewItems; 

               NewItems.cost = cost * NewItems.quantity;

               let total = NewItems.cost
               console.log(total);
            
           }else{
               cart.items.push({itemsUuid, quantity,cost});
           }
           cart = await cart.save();
           //console.log(cart);
           res.json({status:'success',"result":cart})
       }else{
           let NewCart = await Cart.create({userUuid,items:[{itemsUuid,quantity,cost}]})
           res.json({status:'success',message:'NewCart',NewCart});
       }
   }catch(err){
       console.log(err.message);
       res.json({'err':err.message})
   }

})

router.get('/cart',async(req,res)=>{
    try{
        const uuid = req.query.uuid
        let data = await Cart.findOne({uuid:uuid})
        if(data){
            let result = data.items.length
            let total = data.items
            console.log(total[0].cost);
            let totalPrice =0;
            for(let i = 0;i<result;i++){
             totalPrice += total[i].cost
            
            }
            console.log("total",totalPrice);

            const updated = await Cart.findOneAndUpdate({uuid:uuid},{totalPrice:totalPrice},{new:true}).exec();
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
        await userSchema.findOne({uuid:uuid}).exec().then(data=>{
                
            const address = data.address
           Cart.findOneAndUpdate({active:true},{status:'pending',address:address},{new:true}).exec().then(result=>{
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
        const uuid = req.body.uuid
        await Cart.findOneAndUpdate({uuid:uuid},{status:'cancelled',active:false},{new:true}).exec().then(data=>{
            res.json({status:'success',message:'order is cancelled',data})
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
        await Cart.find({active:false}).then(data=>{
            res.json({status:'success',message:'All are cancel orders',data})
        })
    }catch(err){
        res.json({"error":err.message})
    }
})

router.delete("/delete", async (req, res) => {
    try {
      const uuid = req.query.uuid
      await Cart.findOneAndDelete(uuid);
      res.json("Order has been deleted...");
    } catch (err) {
      res.json(err);
    }
  });


module.exports =router



