import express from 'express';
import BodyParser from 'body-parser';
import contactRoutes from './routes/contactRoutes.js';
import 'dotenv/config'
const app = express();
app.use(BodyParser.json());
app.use(contactRoutes)

app.listen(process.env.PORT,(err)=>{
    if(err) throw err;
    console.log(`Server is running on port ${process.env.PORT}`);
});