const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
    validateName,
    validateEmail,
    validatePassword
} = require("../utils/validator");
const User =require("../models/userModel");
const bcrypt =require('bcrypt');

router.post("/signup" , async(req,res)=>{
    try{
        const {name , email ,password, isSeller} = req.body;
        const existingUser =await User.findOne({where:{email:email}});
        if(existingUser){
            return res.status(403).json({err:"user existed"});
        }
        if(!validateName(name)){
            return res.status(400).json({err:"name format wrong"});
        }
        if(!validateEmail(email)){
            return res.status(400).json({err:"email format wrong"});
        }
        if(!validatePassword(password)){
            return res.status(400).json({err:"password format wrong"});
        }

            const hashedPassword =await bcrypt.hash(password,10);
            const user={
                email,
                name,
                isSeller,
                password:hashedPassword
            }

            const createdUser = await User.create(user);
            return res.status(201).json({
                message:"Welcome"
            })
    }
    catch(e){
        return res.status(500).send(e);
    }
});

router.post("/signin" , async(req,res)=>{
    try{
        const{email, password} =req.body;
        if(email.length==0){
            return res.status(400).json({
                err:"please provide email"
            })
        }
        if(password.length==0){
            return res.status(400).json({
                err:"please provide pass"
            })
        }
        const existingUser = await User.findOne({where:{email}});
        if(!existingUser){
            return res.status(404).json({
                err:"user not found"
            })
        }
        const passwordMatch =await bcrypt.compare(password, existingUser.password);
        if(!passwordMatch){
            return res.status(400).json({
                err:"email or password is not matched"
            })
        }
        const payload ={ user:{id: existingUser.id}};
        const bearerToken = await jwt.sign(payload ,"SECRET MESSAGE" ,{
            expiresIn:360000,
        });
        res.cookie('t' , bearerToken , {expire: new Date() + 9999});
         
        return res.status(200).json({
            bearerToken
        })

    }
    catch(e){
        console.log("fsdf" , e);
        return res.status(500).send(e);
    }
});
 router.get('/signout', (req,res)=>{
    try{
        res.clearCookie('t');
        return res.status(200).json({message:"cookie deleted"})

    }
    catch(e){
        return res.status(500).send(e);
    }
 });

module.exports=router;
