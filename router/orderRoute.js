import express from 'express'
import { createOrder,verifyOrder,getOrder } from "../Controllers/order.controller.js";
import auth from '../middleware/auth.js';
const orderRouter = express.Router()


orderRouter.post('/makeOrder',auth,createOrder)
orderRouter.post('/verify',auth,verifyOrder)
orderRouter.get('/',auth,getOrder)
export default orderRouter