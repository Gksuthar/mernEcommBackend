import express from 'express'
import { createOrder } from "../Controllers/order.controller.js";
const orderRouter = express.Router()

orderRouter.post('/makeOrder',createOrder)

export default orderRouter