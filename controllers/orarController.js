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
        connection.query('SELECT * FROM orar', (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = req.query.removed;
                res.render('orar-home', {rows, removedUser,title:'orarhome',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

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
                res.render('orar-home', {rows,title:'orarfind',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })
    })
}

exports.form = (req,res) => {
    res.render('orar-add', {title:'oraradd',layout:'orar-main'});
}

//Add new user
exports.create = (req,res)=>{
    const{ facultate,grupa,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar} = req.body;

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;
        

        //User the connection
        connection.query('INSERT INTO orar SET facultate = ?, grupa =?, profesor_coordonator = ?, email_profesor_coordonator = ?, telefon_profesor_coordonator = ?, orar = ?', [facultate, grupa, profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                res.render('orar-add',{alert:'Grupa '+grupa+' has been added succesfully.',title:'orarnew',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })

        //Creeaza automat grupa si pentru catalog
        connection.query('CREATE TABLE `?` ( `id` INT NOT NULL AUTO_INCREMENT , `nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL , `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ',[grupa],(err)=>{
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
        connection.query('SELECT * FROM orar WHERE id = ?',[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                res.render('orar-edit', {rows,title:'oraredit',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })
    })
}

//Update user
exports.update = (req,res) => {
    const{ facultate,grupa,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar} = req.body;

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('UPDATE orar SET facultate= ?,grupa= ?,profesor_coordonator= ?,email_profesor_coordonator= ?,telefon_profesor_coordonator= ?,orar= ? WHERE id = ?',[facultate,grupa,profesor_coordonator,email_profesor_coordonator,telefon_profesor_coordonator,orar,req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                pool.getConnection((err, connection)=>{
                    if(err) throw err; //not connected
                    console.log('Connected as ID '+connection.threadId);
            
                    //User the connection
                    connection.query('SELECT * FROM orar WHERE id = ?',[req.params.id], (err,rows)=>{
                        //When done with the connection, release it
                        connection.release();
            
                        if(!err){
                            res.render('orar-edit', {rows, alert:'Grupa '+grupa+', from '+facultate+' has been updated.',title:'orarupdate',layout:'orar-main'});
                        } else {
                            console.log(err);
                        }
            
                        console.log("The data from orar table: \n",rows)
            
                    })
                })            
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })
    })
}

//Delete user
exports.delete = (req,res) => {
    const grupa = req.body.grupa;

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        

        connection.query(' DROP TABLE ` ? ` ',[grupa],(err,ok)=>{
            if(err){console.log(err);}
        })
 
        //User the connection
        connection.query('DELETE FROM orar WHERE id = ?',[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = encodeURIComponent('succesfullyRemoved');
                res.redirect('/orar?removed='+removedUser);
            } else {
                console.log(err); 
            }

            console.log("The data from orar table: \n",rows)

        })

        
    })
}

//View users
exports.viewuser = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('SELECT * FROM orar WHERE id = ?',[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                res.render('orar-view', {rows,title:'orarview',layout:'orar-main'});
            } else {
                console.log(err);
            }

            console.log("The data from orar table: \n",rows)

        })
    })
}
