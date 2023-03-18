const mongoose=require('mongoose')
const schema=mongoose.Schema

const tokenSchema= new schema({
    user_id:{
        type:String,
        required:true
    },token:{
        type:String,
        required:true
    },expiredAt:{
        type:Date,
        default:Date.now,
        index:{
            expires:86400000
        }
    }
})
const tokenModel= mongoose.model('token',tokenSchema)
module.exports=tokenModel