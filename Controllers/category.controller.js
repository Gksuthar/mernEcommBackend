import categoyModal from "../models/category.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });



var images = [];
const imageUploader = async (req, res) => {
  try {
    const userId = req.userId;
    // images = [];
    const image = req.files;



    if (!image || image.length === 0) {
      return res
        .status(400)
        .json({ message: "No files uploaded", success: false });
    }
    
    const options = {
        use_filename: true,
        uniquee_filename:false,
        overwrite: false
    }

    for (let i = 0; i < image.length; i++) {
        const img =await cloudinary.uploader.upload(image[i].path,options)
        images.push(img.secure_url)
        fs.unlinkSync(image[i].path)
    }
    return res.status(200).json({  images: images[0] });

    
} catch (error) {
      return res
        .status(400)
        .json({ message: error.message || error, success: false,error : true });

  }
};
const createCategoryController = async (req, res) => {
  try {
    const {name,parentCatName,parentId} = req.body;
    let category = new categoyModal({
      name,parentCatName,parentId,images:images
    })

    if (!category) {
      return res
        .status(500)
        .json({ message:"category is not created", success: false,error : true });
      
    }
    await category.save()

    images = []
    return res
      .status(200)
      .json({ message:"category created",success: true,error :false });
  }
  catch (error) {
      return res
        .status(400)
        .json({ message: error.message || error, success: false,error : true });

  }
};
const getCategoryController = async (req, res) => {
  try {

    const categoryData = await categoyModal.find();
    const categoryMap = {}

    categoryData.forEach((cat)=>categoryMap[cat._id]={...cat._doc,children:[]})

    const rootCategories = []

    categoryData.forEach((cat)=>{
      if (cat.parentId) {
        categoryMap[cat.parentId].children.push(categoryMap[cat._id])
      }else{
        rootCategories.push(categoryMap[cat._id])
      }
    })
    
      return res.status(200).json({
        message: "Categories fetched successfully",
        data: rootCategories,
        success: true,
        error: false,
      });
  
  }
  catch (error) {
      return res
        .status(500)
        .json({ message: error.message || error, success: false,error : true });

  }
};


export { imageUploader,createCategoryController,getCategoryController}