'use strict';

// Require dotenv as top as possible
require('dotenv').config(); // otherwise : $ node -r dotenv/config your_main_process_fileName.js

// Node.js built-ins
/* const path = require('path'); */

// Express.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8787;

// MongoDB
const { MongoClient, ObjectId } = require('mongodb');
const _dbName_ = "testDB"; // initialized on Atlas side , MUST STRICTLY match to target documents to corresponding database
const _connectionURL_ = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4upf6.mongodb.net/${_dbName_}?retryWrites=true&w=majority`; /* 'mongodb://127.0.0.1:27017' */
const _collection_ = "testCOL"; // initialized on Atlas side , must match to target documents to corresponding collection , otherwise mismatch will be added to the cluster list as new collection

const main = async () => {
    
    const client = await MongoClient.connect(_connectionURL_);
    const db = client.db(_dbName_);

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    /* app.use(express.static(path.join(__dirname, './public') )); */

    // CREATE
    app.post('/post-item', async (req, res)=>{
        
        console.log(req.body)
        if(isNaN(req.body.input1) || req.body.input1 == '') req.body.input1 = 0 ;
        await db.collection(_collection_).insertOne(req.body);

    })

    // READ
    app.get('/view-items', async (req, res)=>{
        
        /* console.log(process.env.DB_USER, process.env.DB_PASS) */
        let feedback = await db.collection(_collection_).find({}).toArray();
        res.status(200).json(feedback);

    })

    // DELETE
    app.get('/delete-one-by-id/:targetId', async function(req, res) {
        
        let req_params = req.params.targetId;
        try{
            await db.collection(_collection_).findOneAndDelete({"_id": ObjectId(`${req_params}`)})
            console.log(`A document (record) by id of ${req_params} was removed successfully`)
        }
        catch(e){console.error(e)}
        
    })
    
    // UPDATE
    app.get('/replace-one-by-id/:targetId/input1/:input1/input2/:input2/input3/:input3'
    , /* <--- LEAVE COMMA AS IS ! */
    async function(req, res) {

    let {targetId, input1, input2, input3/* , input4 */} = req.params; /* console.log(req_params); */
    try{
        await db.collection(_collection_).findOneAndReplace(
            {"_id" : ObjectId(targetId)} , {"input1" : input1, "input2" : input2, "input3" : input3/* , "input4" : input4 */}
        )
        console.log(`LOG: Document by id of ${targetId} was replaced ; TIP: Double-check on GUI`)
    }
    catch(e){console.error(e)}

    })

    return 'done.'

}
main()
  .then(/* console.log */)
  .catch(console.error)
  .finally(/* () => client.close() */); // should close() to prevent memory leak (recommended), unless...^ ;
  // ^living HTTP POST request required to be sent......... ;
  // otherwise close the client with Ctrl + C after request done ;

  app.listen(PORT);
  console.log(
  `

  Express server started : open the client on the default user-agent (browser) consuming the following URL :
  http://localhost:${PORT}
  
  `
  )