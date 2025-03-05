import express from 'express'
import { createOrder,verifyOrder } from "../Controllers/order.controller.js";
import auth from '../middleware/auth.js';
const orderRouter = express.Router()


orderRouter.post('/makeOrder',auth,createOrder)
orderRouter.post('/verify',auth,verifyOrder)

export default orderRouter