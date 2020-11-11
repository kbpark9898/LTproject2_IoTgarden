const mongoose = require("mongoose")
const rpiSchema = mongoose.Schema({
    email:{
        type: String,
        trim: true
    },
    rpiName:{
        type:String,
        trim: true
    }
})

const rpi = mongoose.model("rpi", rpiSchema)
module.exports={rpi}