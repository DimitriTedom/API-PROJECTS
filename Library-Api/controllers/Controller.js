import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname,'../database.json')
const csvPath = path.join(__dirname,'../database.csv')

const readBooks = () => {
    if (!fs.existsSync) return [];
    const data = fs.readFileSync(dbPath,'utf-8');
    return JSON.parse(data || '[]');
}

const writeBooks = (books) =>{
    fs.writeFileSync(dbPath,JSON.stringify(books,null,2));
    syncCSV(books);
}
const syncCSV = (books) => {
    const csv = ['id,title,author'].concat(books.map(book => `${book.id},${book.title},${book.author}`)).join('\n');
    fs.writeFileSync(csvPath, csv);
}
const bookController = {
    createBook: (req,res)=>{
        const {title,author} =req.body;
        let books = readBooks();
        const newBook = {id:uuidv4(),title,author}
        books.push(newBook)
        writeBooks(books);
        fs.appendFileSync(csvPath, `\n${newBook.id},${newBook.title},${newBook.author}`);
        res.status(201).json({
            msg:"Book created with success",
            books:books
        })
    },
    getAllBooks: (req,res)=>{
        const books = readBooks();
        syncCSV(books);
        res.status(200).json({
            msg:"These are all the books",
            books:books
        })
    },
    getBookById: (req,res)=>{
        const {id} = req.params;
        const books = readBooks();
        const book = books.find(b=> b.id == id);
        if(!book){
            res.status(404).json({msg:"Book does not exists"})
            return;
        }
            res.status(200).json({msg:"Book found",book:book});
    },
    updateBook: (req,res)=>{
        const {id} = req.params;
        const {title,author} =req.body;
        const books = readBooks();
        // const book = books.find(b=> b.id == id);
          const index = books.findIndex(b => b.id == id);
            if (index === -1) return res.status(404).json({ msg: 'Book not found' });

            books[index] = { ...books[index], title,author };
            writeBooks(books);
            res.json(books[index]);

    },
    deleteBook: (req,res)=>{
        const {id} = req.params;
        const books = readBooks();
        const index = books.findIndex(b => b.id == id);
        if (index === -1) return res.status(404).json({ msg: 'Book not found' });

        books.splice(id,1)[0];
        writeBooks(books);
        res.status(200).json({msg:"Book Deleted with succes",books:books});
    }
}

export default bookController;