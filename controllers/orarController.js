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


//view users
exports.view = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('SELECT * FROM orar', (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = req.query.removed;

                if(req.user){ 
                    if(req.user.admin){
                        res.render('orar-home', {rows, removedUser,title:'orarhome',layout:'orar-main'});
                    } else {
                        res.redirect('/student-orar/'+req.user.grupa);
                    }
                }
                else{
                    res.redirect('/login');
                }

            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })
    })
}

//Find user by search
exports.find = (req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;
        

        //User the connection
        connection.query('SELECT * FROM orar WHERE facultate LIKE ? OR grupa LIKE ? OR profesor_coordonator LIKE ? ', ['%'+searchTerm+'%', '%'+searchTerm+'%', '%'+searchTerm+'%'],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    res.render('orar-home', {rows,title:'orarfind',layout:'orar-main'});
                }
                else{
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })
    })
}

exports.form = (req,res) => {
    if(req.user){
        res.render('orar-add', {title:'oraradd',layout:'orar-main'});
    }
    else{
        res.redirect('/login');
    }
}

//Add new user
exports.create = (req,res)=>{
    const{ facultate,grupa,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar} = req.body;

    const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;
        

        //User the connection
        connection.query('INSERT INTO orar SET facultate = ?, grupa =?, profesor_coordonator = ?, email_profesor_coordonator = ?, telefon_profesor_coordonator = ?, orar = ?', [facultate, grupaLowercaseFaraSpatii, profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    res.render('orar-add',{alert:'Grupa '+grupaLowercaseFaraSpatii+' has been added succesfully.',title:'orarnew',layout:'orar-main'});
                } else{
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })

        //Creeaza automat tabel cu grupa pentru baza de date
        connection.query('CREATE TABLE `'+grupaLowercaseFaraSpatii+'` ( `id` INT NOT NULL AUTO_INCREMENT ,`grupa` VARCHAR(10) NOT NULL,`nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL ,`email` VARCHAR(30) NOT NULL, `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ',(err)=>{
            if(err){
                console.log(err)}
            else{
                console.log("Tabel creat.")
            }
        })
    })
}

//Edit user
exports.edit = (req,res) => {

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('SELECT * FROM orar WHERE grupa = ?',[req.params.grupa], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    res.render('orar-edit', {rows,title:'oraredit',layout:'orar-main'});
                } else { 
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })
    })
}

//Update user
exports.update = (req,res) => {
    const{ facultate,grupa,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar} = req.body;

    const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('UPDATE orar SET facultate= ?,grupa= ?,profesor_coordonator= ?,email_profesor_coordonator= ?,telefon_profesor_coordonator= ?,orar= ? WHERE id = ?',[facultate,grupaLowercaseFaraSpatii,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar,req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                pool.getConnection((err, connection)=>{
                    if(err) throw err; //not connected
                    console.log('Connected as ID '+connection.threadId);
            
                    //User the connection
                    connection.query('SELECT * FROM orar WHERE grupa = ?',[req.params.grupa], (err,rows)=>{
                        //When done with the connection, release it
                        connection.release();
            
                        if(!err){
                            if(req.user){
                                res.render('orar-edit', {rows, alert:'Grupa '+grupaLowercaseFaraSpatii+', from '+facultate+' has been updated.',title:'orarupdate',layout:'orar-main'});
                            } else {
                                res.redirect('/login');
                            }
                        } else {
                            console.log(err);
                        }
            
                        //console.log("The data from orar table: \n",rows)
            
                    })
                })            
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

        })


        connection.query('ALTER TABLE '+req.params.grupa+' RENAME TO '+grupaLowercaseFaraSpatii, 
        (err)=>{if(err){console.log(err)}}
        )



    })
}

//Delete user
exports.delete = (req,res) => {
    
    

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);
 
        //User the connection
        connection.query('DELETE FROM orar WHERE id = ?',[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    let removedUser = encodeURIComponent('succesfullyRemoved');
                    res.redirect('/orar?removed='+removedUser);
                } else{
                    res.redirect('/login');
                }
            } else {
                console.log(err); 
            }

            //console.log("The data from orar table: \n",rows)

        })

        connection.query(' DROP TABLE `'+[req.params.grupa]+'` ',(err,ok)=>{
            if(err){console.log(err);}
        })

        
    })
}

//View users
exports.viewuser = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('SELECT * FROM orar WHERE grupa = ?',[req.params.grupa], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    if(req.user.admin){
                        res.render('orar-view', {rows,title:'orarview',layout:'orar-main'});
                    } else {
                        res.redirect('/student-orar/'+req.params.grupa);
                    }
                }
                else{
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            //console.log("The data from orar table: \n",rows)

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
