const mysql = require('mysql');

//Connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const jwt = require ('jsonwebtoken');
const { promisify } = require('util');

exports.viewOrar = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('SELECT * FROM orar WHERE grupa = ?',[req.params.grupa], (err,rows)=>{
            //When done with the connection, release it
            connection.release();


            if(!err){
                connection.query('SELECT * FROM users WHERE grupa = ?',[req.params.grupa],(errr,studenti)=>{
                    if(errr){console.log(errr)}
                    else{
                        if(req.user){
                            if(req.user.grupa == req.params.grupa){
                                res.render('student-orar', {rows,studenti,title:'studentorarview',layout:'student-orar-main'});
                            }
                            else{
                                if(req.user.admin){
                                    res.redirect('/orar');
                                }else{
                                    res.redirect('/student-orar/'+req.user.grupa);
                                }
                            }
                        }
                        else{
                            res.redirect('/login');
                        }
                    }
                })
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })
    })
}

exports.viewCatalog = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        connection.query('SELECT * FROM orar WHERE grupa=?',[req.params.grupa],(error,prof)=>{
            if(err){console.log(error)}
            else{
                const interogatie = ('SELECT * FROM '+req.params.grupa+' WHERE email = ?');
        //User the connection
        connection.query(interogatie,[req.params.email], (err,rows)=>{
            //When done with the connection, release it
            connection.release();
            
            if(!err){
                if (req.user){
                    if(req.user.grupa == req.params.grupa){
                        if(req.user.email == req.params.email){
                            res.render('student-catalog', {rows,prof,title:'student-catalog',layout:'student-catalog-main'});
                        } else {
                            res.redirect('/student-catalog/'+req.user.grupa+'/'+req.user.email);
                        }
                    }else{
                        if(req.user.admin){
                            res.redirect('/catalog')
                        }else{
                            res.redirect('/student-catalog/'+req.user.grupa+'/'+req.user.email);
                        }
                    }    
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            //console.log("The data from grupa table: \n",rows)

        })
            }
        })
        
    })
}

exports.viewFinanciar = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        connection.query('SELECT * FROM orar WHERE grupa=?',[req.params.grupa],(error,prof)=>{
            if(err){console.log(error)}
            else{
                const interogatie = ('SELECT * FROM '+req.params.grupa+' WHERE email = ?');
                //User the connection
                connection.query(interogatie,[req.params.email], (err,rows)=>{
                    //When done with the connection, release it
                    connection.release();
                    
                    if(!err){
                        if (req.user){
                            if(req.user.grupa == req.params.grupa){
                                if(req.user.email == req.params.email){
                                    res.render('student-financiar', {rows,prof,title:'student-financiar',layout:'student-financiar-main'});
                                } else {
                                    res.redirect('/student-financiar/'+req.user.grupa+'/'+req.user.email);
                                }
                            }else{
                                if(req.user.admin){
                                    res.redirect('/financiar')
                                }else{
                                    res.redirect('/student-financiar/'+req.user.grupa+'/'+req.user.email);
                                }
                            }    
                        } else {
                            res.redirect('/login');
                        }
                    } else {
                        console.log(err);
                    }

                    //console.log("The data from grupa table: \n",rows)
                })
            }
        })
        
    })
}


exports.isLoggedIn = async (req,res,next) => {

    //console.log(req.cookies);
    if ( req.cookies.jwt ){
        try{
            // 1) Verify the token. (make sure token exists, and see which user is this token from)
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            console.log(decoded);

            // 2) Check if the user still exists.
            pool.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, result) =>{

                //console.log(result);

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