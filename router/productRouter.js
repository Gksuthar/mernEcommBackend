import express from 'express'
import multer from 'multer'
import auth from "../middleware/auth.js";

import { imageUploader,createProduct,updateProductQnty, getProduct,getAllProducts,getAllProductsBycatId,getAllProductsBycatName,getAllProductsFilterByPrice,getAllProductsByRating,getAllProductsCount,getAllFeatureProducts,deleteProduct} from "../Controllers/product.controller.js";
const productRouter = express.Router()

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    filename :function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})
const upload = multer({storage})

productRouter.post('/addProduct',createProduct)
productRouter.post('/upload',upload.array('image'),imageUploader)
productRouter.get('/',getAllProducts)
productRouter.get('/getAllProductsBycatId',getAllProductsBycatId)
productRouter.put('/updateProductQnty',auth,updateProductQnty)
productRouter.get('/getAllProductsBycatName',getAllProductsBycatName)
productRouter.get('/getAllProductsFilterByPrice',getAllProductsFilterByPrice)
productRouter.get('/getAllProductsByRating',getAllProductsByRating)
productRouter.get('/getAllProductsCount',auth,getAllProductsCount)
productRouter.get('/getAllFeatureProducts',getAllFeatureProducts)
productRouter.post('/deleteProduct/:id',auth,deleteProduct)
productRouter.get('/:id',getProduct)

export default productRouter