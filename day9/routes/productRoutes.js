const express = require("express");
const router = express.Router();
const uploadContent = require("../utils/fileUpload");
const Product = require("../models/productModel");
const { isAuthenticated, isSeller ,isBuyer } = require("../middlewares/auth");
// const {stripeKey} = require('../config/credentials');
const stripe = require('stripe')("pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3");
// const {WebhookClient} =require('discord.js');



router.post("/create", isAuthenticated, isSeller, (req, res) => {
  uploadContent(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ err: err.message });
    }
    console.log(req.body.file, req.body.price, req.body.file);
    if (!req.body.name || !req.body.price || !req.file) {
      return res
        .status(400)
        .json({ err: "All fields should be selected - name, price, file" });
    }

    if (isNaN(req.body.price)) {
      return res.status(400).json({ err: "Price must be a number" });
    }

    let productDetails = {
      name: req.body.name,
      price: req.body.price,
      content: req.file.path,
    };
    
    const createdProduct = await Product.create(productDetails);

    console.log("Created Product", createdProduct);
    
    return res.status(201).json({ message: "Product created" });
  });
});

router.get("/get/all", isAuthenticated, async (_req, res) => {
  try {
    const products = await Product.findAll();
    return res.status(200).json({ Products: products });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: err.message });
  }
});

router.post('/buy/:productId', isAuthenticated , isBuyer , async(req,res)=>{
  try{
    const product =await Product.findOne({
      where:{id: req.params.productId}

    })?.dataValues;
    if(!product){
      return res.status(404).json({err:"no product found"})
    }
    const orderDetails ={
      productId,
      buyerId: res.user.id  
    }
    let paymentMethod = await stripe.paymentMethod.create({
      type:"card",
      card:{
        number:"4242424242424242",
        exp_month:9,
        exp_year:2023,
        cvc: "314"
      },
    });
    let paymentIntent = await stripe.paymentIntent.create({
      amount: product.price,
      currency:"inr",
      payment_method_types:["card"],
      payment_method:paymentMethod.id,
      confirm:true

    })
    if(paymentIntent){
      const createOrder = Order.create(orderDetails);
      return res.status(200).json({
        createOrder
      })
    }
    else{
      return res.status(400).json({
        err:"payment failed"
      })
    }
  }catch(e){
  return res.status(500).json({err:e});
} } )
module.exports = router;