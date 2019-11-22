const mongoose = require('mongoose');
const dataBaseName = 'debts';
const login = 'admin';
const password = '4pFVam3FWV3ft1z7';
const connectDbUrl =  `mongodb+srv://${login}:${password}@cluster0-ihqqq.mongodb.net/${dataBaseName}`;
const dbConfig = 
{
  useNewUrlParser : true, 
  useFindAndModify : true, 
  useUnifiedTopology: true
};

let Isconnect = false;

function isConnectToDb() {
    if (Isconnect == false) {
        console.log('Databse is not connected !!! ')
        return false;
    }
}

module.exports.connectToMongoDb = async function() {
    try {
      await mongoose.connect(connectDbUrl, dbConfig);
      Isconnect = true;
      console.log('Connect to MongoDb')
    } catch (error) {
      console.log(error);
    }
}

mongoose.connection.on('disconnected', () => {
    module.exports.connectToMongoDb();
})

module.exports.getCollection = async function(collectionName) {
    try {
        if (isConnectToDb() == false) return;
        const collection = await mongoose.connection.db.collection(collectionName);
        return await collection.find({}).toArray();
      } catch (error) {
        console.log(error);
      }
};

module.exports.getCollectionWithParams = async function(collectionName, params){
    try {
        if (isConnectToDb() == false) return;
        const collection = await mongoose.connection.db.collection(collectionName);
        return await collection.find(params).toArray();
      } catch (error) {
        console.log(error);
      }
}

module.exports.addItemInCollection = async function(newCollectionItem) {
    if (isConnectToDb()) return;
    await newCollectionItem.save();
};

module.exports.deleteItemFromCollection = async function (collectionName , deleteCollectionItem) {
    try {
        if (isConnectToDb()== false) return;
        collection = await mongoose.connection.db.collection(collectionName);
        collection.deleteOne({
            firstName : deleteCollectionItem[1],
            lastName : deleteCollectionItem[2]
        });
    } catch (error) {
        console.log(error);
    }
}