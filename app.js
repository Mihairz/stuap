const express = require('express');
const app = express();

const dotenv = require('dotenv'); 
dotenv.config({path:'./.env'});

const path = require('path');
const publicDirectory = path.join(__dirname,'./public');
app.set('view engine','hbs');
app.use(express.static(publicDirectory));

const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: false})); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use(cookieParser());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const exphbs = require('express-handlebars');
const handlebars = exphbs.create({ extname: '.hbs',});
app.engine('.hbs', handlebars.engine);



const mysql = require('mysql'); 
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

db.connect((error)=>{
    if(error){
        console.log(error);
    } else{
        console.log("MYSQL CONNECTED");
    }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/orar', require ('./routes/orar'));
app.use('/catalog', require('./routes/catalog'));
app.use('/grupa', require('./routes/grupa'));

app.use(express.static('public'));
app.use(express.static('upload')); 



const authController = require('./controllers/auth');
const { Server } = require('http');

app.post('/profilePicture', authController.isLoggedIn, (req,res) => {
    let poza;
    let uploadPath;
    //id = req.user.id; console.log("ID IS "+ req.user.id)

    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).send('No files were uploaded.')
    }

    //name of the input is poza
    poza = req.files.poza;
    uploadPath = __dirname + '/upload/' + poza.name;
    console.log(poza);

    //use mv() to place file on the server
    poza.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);

        db.query('UPDATE users SET poza = ? WHERE id = ?',[poza.name, req.user.id], (err,rows)=>{
            if(err){ 
                console.log(err);
            }
        });
        
        res.redirect('profile');
    });
})

app.post('/profilePhone', authController.isLoggedIn, (req,res) => {
    db.query('UPDATE users SET telefon = ? WHERE id = ?',[req.body.telefon, req.user.id], (err,rows)=>{
        if(err){ 
            console.log(err);
        }
    });
    
    res.redirect('profile');
})

app.listen(port=5000, ()=> {
    console.log("Server started on port "+port);
})
