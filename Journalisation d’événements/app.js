import express from 'express';
import BodyParser from 'body-parser';
import eventRoutes from './routes/eventRoutes.js';
import 'dotenv/config'
const app = express();
app.use(BodyParser.json());
app.use(eventRoutes)

app.listen(process.env.PORT,(err)=>{
    if(err) throw err;
    console.log(`Server is running on port ${process.env.PORT}`);
});