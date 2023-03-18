const express=require('express')
const route=express.Router()
const cont=require('../controller/usercont')

const check=require('../middleware/register_check')
route.get('/',cont.home)
route.get('/register',cont.register)
route.get('/login',cont.login)
route.get('/logout',cont.logout)
route.get('/dashboard',cont.authenticate,cont.dashboard),
route.get('/product',cont.authenticate,cont.product),
route.get('/confirmation/:email/:token',cont.confirmation)
route.post('/registration',[check.check_duplicate],cont.registration)
route.post('/login_create',cont.login_create)

module.exports=route