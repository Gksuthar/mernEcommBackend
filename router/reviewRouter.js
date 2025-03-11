import express from 'express';
import { createReview, getProductReviews } from '../controllers/ReviewController.js';
import Auth from '../middleware/auth.js'
const reviewRouter = express.Router();

reviewRouter.post('/create-review',Auth, createReview);
reviewRouter.get('/product-reviews/:productId',Auth, getProductReviews); 

export default reviewRouter;
