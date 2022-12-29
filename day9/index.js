const express = require('express');
const ProductRoutes =require('./routes/productRoutes');

const {connectToDB} = require('./config/db');
const userRoutes = require('./routes/userRoutes.js');
//middlewares;




const PORT = 1338;

const app = express();
connectToDB();
app.use(express.json())
app.use(express.static('content'));
app.use(express.urlencoded({extended:false}));

// app.get('/' , (req,res)=>{
//     console.log("RUNNIG");
//     res.send("hii");
// })
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/product',ProductRoutes);
app.listen( PORT , ()=>{
    console.log("SERVER IS RUNNING");

})