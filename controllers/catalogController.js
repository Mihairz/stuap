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
        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",['stuap'], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = req.query.removed;
                if(req.user){
                    res.render('catalog-home', {rows, removedUser,title:'cataloghome',layout:'catalog-main'});
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            console.log("The data from catalog table: \n",rows)

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
        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE ?", ['stuap','%'+searchTerm+'%'],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                if(req.user){
                    res.render('catalog-home', {rows,title:'catalogfind',layout:'catalog-main'});
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            console.log("The data from catalog table: \n",rows)

        })
    })
}

exports.form = (req,res) => {
    if(req.user){
        res.render('catalog-add', {title:'catalogadd',layout:'catalog-main'});
    } else {
        res.redirect('/login');
    }
}

//Add new user
exports.create = (req,res)=>{
    const{grupa} = req.body;
    const grupaFaraSpatii = grupa.replace(/ +/g, '');
    
    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;

        connection.query('CREATE TABLE `'+grupaFaraSpatii+'` ( `id` INT NOT NULL AUTO_INCREMENT ,`grupa` VARCHAR(10) NOT NULL ,`nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL ,`email` VARCHAR(30) NOT NULL, `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ',(err)=>{
            if(err){
                console.log(err)}
            else{
                console.log("Tabel creat.")
                if(req.user){
                    res.render('catalog-add',{alert: grupaFaraSpatii+' added succesfully.',title:'catalognew',layout:'catalog-main'});
                } else {
                    res.redirect('/login');
                }
            }
        })
    })
}

//Edit user
exports.edit = (req,res) => {

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);
        
        const catalog = req.params.catalog;

        if(req.user){
            res.render('catalog-edit', {catalog,title:'catalogedit',layout:'grupa-main'});
        } else {
            res.redirect('/login');
        }

        })
}

//Update user
exports.update = (req,res) => {
    const{grupa} = req.body;
    const grupaFaraSpatii = grupa.replace(/ +/g, '');

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        const interogatie = ('ALTER TABLE '+req.params.catalog+' RENAME TO '+grupaFaraSpatii); 

        //User the connection
        connection.query(interogatie, (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                pool.getConnection((err, connection)=>{
                    if(err) throw err; //not connected
                    console.log('Connected as ID '+connection.threadId);
                    
                    if(req.user){
                        res.render('catalog-edit', {alert: grupaFaraSpatii+' updated succesfully.',title:'catalogupdate',layout:'catalog-main'});
                    } else {
                        res.redirect('/login');
                    }

                    })   
            } else {
                console.log(err);
            }

            console.log("The data from catalog table: \n",rows)

        })

        connection.query('UPDATE '+grupaFaraSpatii+' SET grupa= ? ',[grupaFaraSpatii], (err)=>{
            if(err){console.log(err)}
            else{console.log("Updated succesfully.")}
        })    
    })
}


//Delete user
exports.delete = (req,res) => {

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('DROP TABLE `'+req.params.catalog+'`', (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = encodeURIComponent('User succesfully removed.');
                if(req.user){
                    res.redirect('/catalog?removed='+removedUser);
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            console.log("The data from catalog table: \n",rows)
        })
    })
}


//View users
exports.viewuser = (req,res)=>{
    
    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);
        
       
        //User the connection
        connection.query('SELECT * FROM ?',[req.params.table], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = req.query.removed;
                if(req.user){
                    res.render('grupa-home', {rows, removedUser,title:'orarhome',layout:'orar-main'});
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

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
