import express from 'express';
import BodyParser from 'body-parser';
import LibraryRouter from './routes/Routes.js';
const app = express();
app.use(BodyParser.json());
app.use(LibraryRouter)

app.listen(3000,(err)=>{
    if(err) throw err;
    console.log('Server is running on port 3000');
});