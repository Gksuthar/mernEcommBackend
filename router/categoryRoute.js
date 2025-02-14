import express from 'express'
import { Router } from 'express'
import {imageUploader,createCategoryController,getCategoryController} from '../Controllers/category.controller.js'
import multer from 'multer'
import auth from '../middleware/auth.js'
const storage =  multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'uploads')
    },
    filename : function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})

const upload = multer({storage})
const routerCat = express.Router()
routerCat.post('/imageUpload',upload.array('image'),auth,imageUploader)
routerCat.post('/createCategoryController',auth,createCategoryController)
routerCat.get('/',auth,getCategoryController)

export default routerCat