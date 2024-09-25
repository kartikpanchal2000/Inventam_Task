const mongoose = require('mongoose')

//schema
const categoriesSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    parentId: {
       type: Number, 
        unique:true,
        default: null
    }
});

const categoryModel = mongoose.model('Categories',categoriesSchema);

module.exports =categoryModel;