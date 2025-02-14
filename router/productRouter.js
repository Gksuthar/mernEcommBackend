import express from 'express'
import multer from 'multer'
import auth from "../middleware/auth.js";
import { imageUploader,createProduct,getProduct,getAllProducts,getAllProductsBycatId,getAllProductsBycatName,getAllProductsFilterByPrice,getAllProductsByRating,getAllProductsCount,getAllFeatureProducts,deleteProduct} from "../Controllers/product.controller.js";
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

productRouter.post('/addProduct',auth,createProduct)
productRouter.post('/upload',upload.array('image'),auth,imageUploader)
productRouter.get('/',getAllProducts)
productRouter.get('/getAllProductsBycatId',auth,getAllProductsBycatId)
productRouter.get('/getAllProductsBycatName',auth,getAllProductsBycatName)
productRouter.get('/getAllProductsFilterByPrice',auth,getAllProductsFilterByPrice)
productRouter.get('/getAllProductsByRating',auth,getAllProductsByRating)
productRouter.get('/getAllProductsCount',auth,getAllProductsCount)
productRouter.get('/getAllFeatureProducts',auth,getAllFeatureProducts)
productRouter.post('/deleteProduct/:id',auth,deleteProduct)
productRouter.get('/:id',auth,getProduct)

export default productRouter