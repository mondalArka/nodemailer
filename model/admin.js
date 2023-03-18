const joi=require('joi')
const mongoose=require('mongoose')
const schema=mongoose.Schema

const userMode= new schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:true
    }
})

const adminModel=mongoose.model('authenticate_admin',userMode)
module.exports=adminModel

