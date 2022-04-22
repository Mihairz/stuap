const mysql = require('mysql');


//Connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});



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
                res.render('catalog-home', {rows, removedUser,title:'cataloghome',layout:'catalog-main'});
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
                res.render('catalog-home', {rows,title:'catalogfind',layout:'catalog-main'});
            } else {
                console.log(err);
            }

            console.log("The data from catalog table: \n",rows)

        })
    })
}

exports.form = (req,res) => {
    res.render('catalog-add', {title:'catalogadd',layout:'catalog-main'});
}

//Add new user
exports.create = (req,res)=>{
    const{grupa} = req.body;
    const grupaFaraSpatii = grupa.replace(/ +/g, '');
    
    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;

        connection.query('CREATE TABLE `?` ( `id` INT NOT NULL AUTO_INCREMENT , `nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL , `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ',[grupaFaraSpatii],(err)=>{
            if(err){
                console.log(err)}
            else{
                console.log("Tabel creat.")
                res.render('catalog-add',{alert: grupaFaraSpatii+' added succesfully.',title:'catalognew',layout:'catalog-main'});
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

        res.render('catalog-edit', {catalog,title:'catalogedit',layout:'grupa-main'});

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
                   
                    res.render('catalog-edit', {alert: grupaFaraSpatii+' updated succesfully.',title:'catalogupdate',layout:'catalog-main'});
            
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
                res.redirect('/catalog?removed='+removedUser);
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
                res.render('grupa-home', {rows, removedUser,title:'orarhome',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })
    })
}
