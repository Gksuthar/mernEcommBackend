import { create } from "domain";
import { createOrder } from "../Controllers/order.controller";
import express from 'express'
const orderRouter = express.Router()

orderRouter.post('/makeOrder',createOrder)

export default orderRouter