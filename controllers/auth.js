const mysql = require('mysql');

const dotenv = require('dotenv');
dotenv.config({path:'./.env'}); 

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');

exports.login = async (req,res) => {
    try{
        const {email, password} = req.body;

        if( !email || !password ){
            return res.status(400).render('login',
            {message:'Please provide both email and password.'})
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
            if( !results[0] || !(await bcrypt.compare(password, results[0].password)) ) {
              res.status(401).render('login', {
                message: 'Email or Password is incorrect'
              })
            } else {
              const id = results[0].id; 

              const token = jwt.sign({id:id}, process.env.JWT_SECRET,{
                  expiresIn: process.env.JWT_EXPIRES_IN
              })

              console.log("The token is "+token);

              const cookieOptions = {
                  expires: new Date(
                      Date.now() + process.env.JWT_COOKIE_EXPIRES *24*60*60*1000
                  ),
                  httpOnly: true
              }

              res.cookie('jwt', token, cookieOptions)
              res.status(200).redirect('/');
            }}
        )
        

    }catch(error){
        console.log(error);
    }
}

exports.register = (req,res)=>{
    console.log(req.body);

    //const name = req.body.name;
    //const email = req.body.email;
    //const password = req.body.password;
    //const passwordConfirm = req.body.passwordConfirm;
    const {name, email, password, passwordConfirm} = req.body;

    if (!name || !email || !password || !passwordConfirm){
        return res.render('register',{
            message:'Te rog sa introduci toate datele necesare.'
        })
    }else{
        db.query('SELECT email FROM users WHERE email = ?', [email], async (error,results) => {
            if(error){
                console.log(error);
            }

            if( results.length > 0){
                return res.render('register',{
                    message:'Email is already taken'
                })
            }
            else if (password !== passwordConfirm){
                return res.render('register',{
                    message:'Passwords do not match.'
                })
            }

            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);

            db.query('INSERT INTO users SET ?', {name:name, email:email, password:hashedPassword},
                (error, results) => { 
                    if(error){console.log(error)}
                    else{
                        console.log(results);
                        return res.render('register',{
                            succesMessage:'User registered succesfully.'
                        })
                    }
                }
            )      
        })
    }
}

const { promisify } = require('util');

exports.isLoggedIn = async (req,res,next) => {

    //console.log(req.cookies);
    if ( req.cookies.jwt ){
        try{
            // 1) Verify the token. (make sure token exists, and see which user is this token from)
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            console.log(decoded);

            // 2) Check if the user still exists.
            db.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, result) =>{

                console.log(result);

                if(!result){
                    return next();
                }

                req.user = result[0];
                return next();
            })

        }catch(error){
            console.log(error);
            return next();
        }
    }else{
        next(); 
    }
} 

exports.logout = async (req,res) => {
    res.cookie("jwt","logout", {
        expires: new Date(Date.now()+2*1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
}

exports.isAdmin = (req,res) => {
    console.log(user.admin);
}