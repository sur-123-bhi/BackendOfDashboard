const express = require('express');
const cors = require('cors');
const {connection} = require('./config/connection');
const {energyInfoDataRoute} = require('./routes/energyInfoData.route.js');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/datas', energyInfoDataRoute);

app.listen(process.env.port, async () => {
    try{
        await connection;
        console.log(`Server running on port ${process.env.port}`);
    } catch (error) {
        console.log(error.message);
    }
});
