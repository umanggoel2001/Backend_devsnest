 //next means to go to next middleware
 const jwt =require('jsonwebtoken');
const User = require('../models/userModel');
 const isAuthenticated =async(req, res ,next)=>{
    try{
        const authHeader =req.headers.authorization;// bearers {token}
        if(!authHeader){
            return res.status(401).json({
                err:"header not found"
            })
        }
        const token =authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({
                err:"token not found"
            })
        }
        const decoded = jwt.verify(token , "SECRET MESSAGE");
        const user = await User.findOne({where:{id: decoded.user.id}});
        if(!user){
            return res.status(404).json({
                err:"user not found"
            })
        }
        req.user=user;
        next();

    }
    catch(e){
        return res.status(500).send(e);
    }
 };

 const isSeller =async(req,res, next)=>{
    if(req.user.dataValues.isSeller){
        next();
    }
    else{
        return res.status(401).json({
            err:"You are not Seller"
        })
    }
 }

 const isBuyer =async(req,res, next)=>{
    if(!req.user.dataValues.isSeller){
        next();
    }
    else{
        return res.status(401).json({
            err:"You are not Seller"
        })
    }
 }
 module.exports={isAuthenticated , isSeller ,isBuyer };