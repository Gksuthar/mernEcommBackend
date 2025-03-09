import mongoose from "mongoose";
import ProductModal from "../models/product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { profileEnd } from "console";
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
      uniquee_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image.length; i++) {
      const img = await cloudinary.uploader.upload(image[i].path, options);
      images.push(img.secure_url);
      fs.unlinkSync(image[i].path);
    }
    return res.status(200).json({
      message: "Images uploaded successfully",
      images: images, 
      success: true,
    });  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const createProduct = async (req, res) => {
  try {
    // const userId = req.userId;
    const {
      name,
      description,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCatId,
      subCat,
      thirdSubCat,
      thirdSubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      productRam,
      size,
      productWeight,
    } = req.body;

    const newProduct = new ProductModal({
      name,
      description,
      images,
      brand,
      price,
      oldPrice,
      catName,
      catId,
      subCatId,
      subCat,
      thirdSubCat,
      thirdSubCatId,
      category,
      countInStock,
      rating,
      isFeatured,
      discount,
      productRam,
      size: size.split(',').map(item => item.trim()),
      productWeight,
    });

    const savedProduct = await newProduct.save();

    if (!savedProduct) {
      return res
        .status(500)
        .json({ message: "Product Not Created", success: false, error: true });
    }
    images = [];
    return res
      .status(200)
      .json({ data: savedProduct, success: true, error: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllProductsBycatId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const { id } = req.params; 

    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const { category } = req.body;
    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find({ catId: req.query.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllProductsBycatName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);

    const totalPosts = await ProductModal.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
      return res
        .status(404)
        .json({ message: "Page not found", success: false, error: true });
    }

    const products = await ProductModal.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .exec();

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found", success: false, error: true });
    }

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: products,
        success: true,
        error: false,
        totalPages: totalPages,
        page: page,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllProductsFilterByPrice = async (req, res) => {
  try {
    let productList = [];
    if (req.query.catId !== "" && req.query.catId !== undefined) {
      const ProductListArr = await ProductModal.find({
        catId: req.query.catId,
      }).populate("category");

      productList = ProductListArr;
    }
    if (req.query.subCat !== "" && req.query.subCat !== undefined) {
      const ProductListArr = await ProductModal.find({
        subCatId: req.query.subCatId,
      }).populate("category");

      productList = ProductListArr;
    }
    if (req.query.thirdSubCat !== "" && req.query.thirdSubCat !== undefined) {
      const ProductListArr = await ProductModal.find({
        thirdSubCatId: req.query.thirdSubCatId,
      }).populate("category");

      productList = ProductListArr;
    }

    const filterProducts = productList.filter((product) => {
      if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
        return false;
      }
      if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
        return false;
      }
      return true;
    });

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: filterProducts,
        success: true,
        error: false,
        totalPages: 0,
        page: 0,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllProductsByRating = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const perPage = parseInt(req.query.perPage) || 10; 

    let filters = {};
    
    if (req.query.rating) {
      filters.rating =  req.query.rating       
    }
    if (req.query.catId && req.query.catId !== '') {
      filters.catId = req.query.catId;
    }
    if (req.query.subCatId && req.query.subCatId !== '') {
      filters.subCatId = req.query.subCatId;
    }
    if (req.query.thirdSubCat && req.query.thirdSubCat !== '') {
      filters.thirdSubCat = req.query.thirdSubCat;
    }

    const ProductListArr = await ProductModal.find(filters).populate('category').skip((page - 1) * perPage).limit(perPage);

    return res
      .status(200)
      .json({
        message: "items fetched successfully",
        products: ProductListArr,
        success: true,
        error: false,
        totalPages: 0,
        page: 0,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllProductsCount = async (req, res) => {
  try {
    
    const productsCount = await ProductModal.countDocuments()
    if (!productsCount) {
        return res
          .status(500)
          .json({ success: false, error: true });
      
        }
        return res
          .status(200)
          .json({data:productsCount, success: true, error: false });
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getAllFeatureProducts = async (req, res) => {
  try {
    
    const products = await ProductModal.find({
      isFeatured:true
    }).populate('category')  
    if (!products) {
        return res
          .status(500)
          .json({ success: false, error: true });
      
        }
        return res
          .status(200)
          .json({data:products, success: true, error: false });
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const deleteProduct = async (req, res) => {
  try {
    
    const products = await ProductModal.findById(req.params.id).populate('category')
    if (!products) {
        return res
          .status(400)
          .json({ success: false, error: true });
      
        }
        const images  = products.images
        for(let img of images){
          const imageUrl = img;
          const urlArr = imageUrl.split('/')
          const image = urlArr[urlArr.length-1]
          const imageName = image.split(".")[0];
          if (imageName) {
            cloudinary.uploader.destroy(imageName,(error,result)=>{
              if (error) {
                console.error('Error deleting image:', error);
              }
            })

          }

        }
        const deleteProduct = await ProductModal.findByIdAndDelete(req.params.id)
        if (!deleteProduct) {       
          return res
            .status(404)
            .json({ message:"product not deleted", success: false, error: true });
          }
          
          return res
            .status(200)
            .json({ message:"product  deleted", success: true, error:false });
  
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
const getProduct = async (req, res) => {
  try {
    
    const product = await ProductModal.findById(req.params.id).populate('category')
    if (!product) {
        return res
          .status(400)
          .json({message:"The product is not found", success: false, error: true });
      
        }
       
          return res
            .status(200)
            .json({ message:"product fetched", success: true, error:false,product:product});
  
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export {
  imageUploader,
  createProduct,
  getAllProducts,
  getAllProductsBycatId,
  getAllProductsBycatName,
  getAllProductsFilterByPrice,
  getAllProductsByRating,
  getAllProductsCount,
  getAllFeatureProducts,
  deleteProduct,
  getProduct

};
