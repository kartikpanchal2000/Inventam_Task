const Mongoose= require('mongoose')

const  dbConn= async () => {   
    try{
        const conn = await Mongoose.connect('mongodb+srv://kkpanch2000:Admin123@democluster.ngzqk9w.mongodb.net/InventamTask');
        console.log("Mongodb Connected "); 
    }
    catch(error)
    {
        console.log("Mongodb Connection :",error);
    }
}

module.exports = dbConn;

