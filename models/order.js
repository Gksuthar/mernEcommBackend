import { timeStamp } from "console";
import mongoose from "mongoose";
import { type } from "os";

const orderSchema = mongoose.Schema({
    userId :{
        type : mongoose.Schema.ObjectId,
        ref  : "User"
    },
    orderId :{  
        type :String,
        require : [true,"Provide orderId"],
        unique : true
    },
    productId :{  
        type :mongoose.Schema.ObjectId,
        ref  : "Product"
    },
   
    paymentId :{  
        type:String,
        default :"",
    },
    paymentStatus :{  
        type:String,
        default :"",
    },
    delivery_address :{  
        type:mongoose.Schema.ObjectId,
        ref :"address",
    },
    subTotalAmt :{  
        type:Number,
        default:0,
    },
    invoice_receipt :{  
        type:String,
        default:"",
    },
},{
    timeStamp : true
})

const OrderData = mongoose.model('Order',orderSchema)
export default OrderData