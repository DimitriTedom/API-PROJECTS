import express from 'express';
import BodyParser from 'body-parser';
import convertRouter from './routes/convertRoutes';
import morgan from 'morgan';

const app = express();
app.use(BodyParser.json());
app.use(convertRouter)
app.use(morgan);
app.listen(3000,(err)=>{
    if(err) throw err;
    console.log('Server is running on port 3000');
});