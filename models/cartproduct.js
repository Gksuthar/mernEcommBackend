import mongoose from "mongoose";

const cartProductSchema = mongoose.Schema({
    productId : {
        type:  mongoose.Schema.ObjectId,
        ref : 'Product'
    },
    quantity :{
        type : Number,
        default :1 
    },
    userId :{
        type : mongoose.Schema.ObjectId,
        ref : 'User' 
    },
},{
    timeStamps : true
})

const CartProduct  = mongoose.model('cartproduct',cartProductSchema)
export default CartProduct  