import express from "express";
import { emailVarification, registerUserController, loginUserController, logoutController, imageUploader,updateUserDetails,forgetPassword,verifyOtpContoller,resetpasswordController,refreshTokenController,userDetails } from "../Controllers/user.controller.js";
import auth from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`); 
    }
});

const upload = multer({ storage });

router.post('/register', registerUserController);
router.post('/verifyEmail', emailVarification);
router.post('/Login', loginUserController);
router.post('/Logout', auth, logoutController);
router.post('/user-avatar',auth, upload.array('avatar'), imageUploader);
router.put('/:id',auth,updateUserDetails);
router.post('/forgetpassword',forgetPassword);
router.post('/verifyOtp',verifyOtpContoller);
router.post('/resetpassword',resetpasswordController);
router.post('/refeshToken',refreshTokenController);
router.post('/user-details',auth,userDetails);

export default router;
