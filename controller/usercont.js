let userModel = require('../model/user')
let tokenModel = require('../model/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mail = require('nodemailer')
const crypto = require('crypto')

const home = (req, res) => {
    console.log(req.user);

    res.render('home', {
        data: req.user
    })

}

const dashboard = (req, res) => {
    if (req.user) {
        userModel.find({}, function (err, userdetail) {
            if (!err) {
                res.render('dashboard', {
                    data: req.user,
                    details: userdetail
                })
            } else {

                console.log(err);
            }
        })
    }
}
const product = (req, res) => {
    res.render('product', {
        data: req.user
    })
}



const register = (req, res) => {
    res.render('register', {
        message: req.flash('message'),
        message1: req.flash('message1'),
        data: req.user

    })
    
}

const registration = (req, res) => {
    const data = new userModel({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }).save((err, user) => {
        if (!err) {
            tokenModel({
                user_id: user._id,
                token: crypto.randomBytes(16).toString('hex')
            }).save((err, token) => {
                if (!err) {
                    var transporter = mail.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: 'ryandey6@gmail.com',
                            pass: 'nvglqpqpraprczjo'
                        }
                    })
                    var mailOptions = {
                        from: 'no-reply@ryan.com',
                        to: user.email,
                        subject: 'Account Verification',
                        text: 'Hello' + req.body.name + '\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/'+req.headers.host+'\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank you!\n'
                    }
                    transporter.sendMail(mailOptions,(err)=>{
                        if(err){
                            console.log('Technical Issue');
                        }else{
                            req.flash('message','A verification email has been sent to your mail. Please click the link to verify your email')
                            res.redirect('/register')
                        }
                    })
                }else{
                    console.log('Err when create token');
                }
            })
        }else{
            console.log('Err when create user');
        }

    })
}
const confirmation=(req,res)=>{
    tokenModel.findOne({token:req.params.token},(err,token)=>{
        if(!token){
            req.flash('message','Token expired')
            res.redirect('/register')
            console.log('token expired');
        }else{
            userModel.findOne({_id:token.user_id,email:req.params.email},(err,user)=>{
                if(!user){
                    req.flash('message','user not found')
                }
                else if(user.isVerified){
                    req.flash('message','User already verified')
                }else{
                    user.isVerified=true
                    user.save().then(result=>{
                        req.flash('message','User Verified')
                        res.redirect('/login')
                    }).catch(err=>{
                        console.log(err);
                    })
                }
                
            })
        }
    })
}

const login_create = (req, res) => {
    userModel.findOne({
        email: req.body.email
    }).exec((err, data) => {
        if (data) {
            if(data.isVerified==true){
                const hashpassword = data.password
                if (bcrypt.compareSync(req.body.password, hashpassword)) {
                    const token = jwt.sign({
                        id: data._id,
                        name: data.name
                    }, "Arka@12345678", { expiresIn: "5h" })
                    res.cookie('userToken', token)
                    if (req.body.rememberme) {
                        res.cookie('email', req.body.email)
                        res.cookie('password', req.body.password)
                    }
    
                    res.redirect('/dashboard')
                }else {
                    req.flash("message", "Invalid password")
                    res.redirect('/login')
                }
            }else{
                req.flash('message',"User not verified")
                res.redirect('/login')
            } 
        } else {
            req.flash("message", "Invalid email")
            res.redirect('/login')
        }
    })
}
authenticate = (req, res, next) => {
    if (req.user) {
        console.log(req.user);
        next()

    } else {
        req.flash("message", "login first")
        res.redirect('/login')
    }
}



const login = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    res.render('login', {
        message: req.flash('message'),
        message2: req.flash('message2'),

        data1: loginData,
        data: req.user
    })
}

const logout = (req, res) => {
    res.clearCookie("userToken")

    res.redirect('/login')
}
module.exports = {
    register,
    login,
    registration,
    login_create,
    dashboard,
    authenticate,
    logout,
    home,
    confirmation,
    product
}