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
        
        console.log(req.params.grupa);
        
        const intero = ("SELECT * FROM ");
        console.log(intero);

        const interogatie = intero + req.params.grupa;
        console.log(interogatie);
        

        //User the connection
        connection.query(interogatie, (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let removedUser = req.query.removed;
                let grupamea = req.params.grupa;
                res.render('grupa-home', {rows, removedUser,grupamea,title:'grupahome',layout:'grupa-main'});
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}

//Find user by search
exports.find = (req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;
        interogatie = ("SELECT * FROM "+req.params.grupa+" WHERE nume LIKE ? OR prenume LIKE ?");

        //User the connection
        connection.query(interogatie, ['%'+searchTerm+'%', '%'+searchTerm+'%'],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                let grupamea = req.params.grupa;
                res.render('grupa-home', {rows,grupamea,title:'grupafind',layout:'grupa-main'});
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}

exports.form = (req,res) => {
    const grupamea = req.params.grupa;
    res.render('grupa-add', {grupamea,title:'grupaadd',layout:'grupa-main'});
}

//Add new user
exports.create = (req,res)=>{
    const{ nume,prenume,email,note} = req.body;

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        let searchTerm = req.body.search;
        
        //User the connection
        connection.query('INSERT INTO '+req.params.grupa+' SET grupa = ?, nume =?, prenume = ?, email = ?, note = ?', [req.params.grupa, nume, prenume, email, note],(err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                const grupamea = req.params.grupa;
                res.render('grupa-add',{grupamea,alert:'Student '+nume+' '+prenume+' has been added succesfully.',title:'grupanew',layout:'grupa-main'});
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}

//Edit user
exports.edit = (req,res) => {

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        const interogatie = ('SELECT * FROM '+req.params.grupa+' WHERE id = ?');

        //User the connection
        connection.query(interogatie,[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                const grupamea = req.params.grupa;
                res.render('grupa-edit', {rows,grupamea,title:'grupaedit',layout:'grupa-main'});
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}

//Update user
exports.update = (req,res) => {
    const{ nume,prenume,email,note} = req.body;

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        //User the connection
        connection.query('UPDATE '+req.params.grupa+' SET grupa= ?,nume= ?,prenume = ?,email= ?,note= ? WHERE id = ?', [req.params.grupa,nume,prenume,email,note,req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                pool.getConnection((err, connection)=>{
                    if(err) throw err; //not connected
                    console.log('Connected as ID '+connection.threadId);
            
                    //User the connection
                    connection.query('SELECT * FROM '+req.params.grupa+' WHERE id = ?',[req.params.id], (err,rows)=>{
                        //When done with the connection, release it
                        connection.release();
            
                        if(!err){
                            const grupamea = req.params.grupa;
                            res.render('grupa-edit', {rows,grupamea, alert:'Student '+nume+' '+prenume+' has been updated succesfully.',title:'grupaupdate',layout:'grupa-main'});
                        } else {
                            console.log(err);
                        }
            
                        console.log("The data from grupa table: \n",rows)
            
                    })
                })            
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}

//Delete user
exports.delete = (req,res) => {

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        const interogatie = ('DELETE FROM '+req.params.grupa+' WHERE id = ?');
 
        //User the connection
        connection.query(interogatie,[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                grupamea = req.params.grupa;
                let removedUser = encodeURIComponent('succesfullyRemoved');
                res.redirect('/grupa/'+grupamea+'?removed='+removedUser);
            } else {
                console.log(err); 
            }

            console.log("The data from grupa table: \n",rows)

        })

        
    })
}

//View users
exports.viewuser = (req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err; //not connected
        console.log('Connected as ID '+connection.threadId);

        const interogatie = ('SELECT * FROM '+req.params.grupa+' WHERE id = ?');
        //User the connection
        connection.query(interogatie,[req.params.id], (err,rows)=>{
            //When done with the connection, release it
            connection.release();

            if(!err){
                grupamea = req.params.grupa;
                res.render('grupa-view', {rows,grupamea,title:'grupaview',layout:'grupa-main'});
            } else {
                console.log(err);
            }

            console.log("The data from grupa table: \n",rows)

        })
    })
}
