import express from 'express'
import { setUserAddress } from '../Controllers/address.controller'
import Auth from '../middleware/auth.js'
const addressRouter = express.Router()

addressRouter.post('/addAddress',Auth,setUserAddress)

export default addressRouter