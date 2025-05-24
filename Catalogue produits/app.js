import express from 'express';
import BodyParser from 'body-parser';
import productRouter from './routes/productRoutes.js';
import morgan from 'morgan';

const app = express();
app.use(BodyParser.json());
app.use(productRouter)
app.use(morgan);
app.listen(3000,(err)=>{
    if(err) throw err;
    console.log('Server is running on port 3000');
});