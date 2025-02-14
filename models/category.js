import { timeStamp } from "console";
import mongoose, { mongo } from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required:true,
        trim : true
      },
      images: [
        {
        type: String,
        
      }
    ],
      parentCatName: {
        type: String,
        default: "",
      },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        default: null,
      },

},{timestamps:true})

const categoryModal = mongoose.model('Category',categorySchema)
export default categoryModal