const express=require("express"),
r=express.Router();
r.use("/auth",require("./authRoutes"));
module.exports=r;