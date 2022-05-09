const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

//View users
exports.view = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err; 

        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", ['stuap'], (err, rows) => {
            connection.release();

            for (var key in rows) {
                if (rows[key].TABLE_NAME == "orar" || rows[key].TABLE_NAME == "users" || rows[key].TABLE_NAME == "facultati") {
                    delete rows[key];
                }
            }

            if (!err) {
                let removedUser = req.query.removed;
                if (req.user) {
                    if (req.user.admin) {
                        res.render('catalog-home', { rows, removedUser, title: 'cataloghome', layout: 'catalog-main' });
                    } else {
                        res.redirect('/student-catalog/' + req.user.grupa + '/' + req.user.email);
                    }
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })
    })
}

//Find user by search
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; 
        
        let searchTerm = req.body.search;

        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE ?", ['stuap', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            for (var key in rows) {
                if (rows[key].TABLE_NAME == "orar" || rows[key].TABLE_NAME == "users" || rows[key].TABLE_NAME == "facultati") {
                    delete rows[key];
                }
            }

            if (!err) {
                
                if (req.user) {
                    if(req.user.admin){
                        res.render('catalog-home', { rows, title: 'catalogfind', layout: 'catalog-main' });
                    } else {
                        res.redirect("/");
                    }
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })
    })
}

exports.form = (req, res) => {
    if (req.user) {
        if(req.user.admin){
            res.render('catalog-add', { title: 'catalogadd', layout: 'catalog-main' });
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/login');
    }
}

//Add new user
exports.create = (req, res) => {
    const { grupa } = req.body;
    const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

    pool.getConnection((err, connection) => {
        if (err) throw err;
        

        let searchTerm = req.body.search;
        if(req.user.admin){
            connection.query('CREATE TABLE `' + grupaLowercaseFaraSpatii + '` ( `id` INT NOT NULL AUTO_INCREMENT ,`facultate` VARCHAR(10) NOT NULL,`grupa` VARCHAR(10) NOT NULL ,`nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL ,`email` VARCHAR(30) NOT NULL,`telefon` VARCHAR(10) NOT NULL, `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ', (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Tabel creat.")
                    if (req.user) {
                        res.render('catalog-add', { alert: grupaLowercaseFaraSpatii + ' added succesfully.', title: 'catalognew', layout: 'catalog-main' });
                    } else {
                        res.redirect('/login');
                    }
                }
            })

            //Creeaza automat si intrare in tabelul orare
            connection.query('INSERT INTO orar SET grupa=?', [grupaLowercaseFaraSpatii], (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Intrare in tabelul orar creata.");
                }
            })
        }
    })
}

//Edit user
exports.edit = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        

        const catalog = req.params.catalog;

        if (catalog == "orar" || catalog == "users") {
            res.redirect('/catalog');
        } else {
            if (req.user) {
                if(req.user.admin){
                    res.render('catalog-edit', { catalog, title: 'catalogedit', layout: 'grupa-main' });
                } else {res.redirect('/');}
            } else {
                res.redirect('/login');
            }
        }

    })
}

//Update user
exports.update = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        

        if (req.params.catalog == "orar" || req.params.catalog == "users") {
            res.redirect('/catalog');
        } else {

            const grupaLowercaseFaraSpatii = ((req.body.grupa).replace(/ +/g, '')).toLowerCase();

            if (!grupaLowercaseFaraSpatii) {
                if (req.user) {
                    const catalog = req.params.catalog;
                    res.render('catalog-edit', { catalog, eroare: 'Te rog sa introduci toate datele necesare.', title: 'catalogupdate', layout: 'catalog-main' });
                } else {
                    res.redirect('/login');
                }
            }

            if(req.user.admin){
                connection.query('UPDATE ' + req.params.catalog + ' SET grupa =?', [grupaLowercaseFaraSpatii], (err) => { if (err) { console.log(err) } })
                connection.query('UPDATE users SET grupa=? WHERE grupa = ?', [grupaLowercaseFaraSpatii, req.params.catalog], (err) => { if (err) { console.log(err) } })

                const interogatie = ('ALTER TABLE ' + req.params.catalog + ' RENAME TO ' + grupaLowercaseFaraSpatii);

                connection.query(interogatie, (err, rows) => {
                    connection.release();

                    if (!err) {
                        pool.getConnection((err, connection) => {
                            if (err) throw err; 

                            if (req.user) {
                                res.render('catalog-edit', {catalog:grupaLowercaseFaraSpatii, alert: grupaLowercaseFaraSpatii + ' updated succesfully.', title: 'catalogupdate', layout: 'catalog-main' });
                            } else {
                                res.redirect('/login');
                            }

                        })
                    } else {
                        console.log(err);
                    }
                })

                connection.query('UPDATE orar SET grupa= ? WHERE grupa = ?', [grupaLowercaseFaraSpatii, req.params.catalog], (err) => {
                    if (err) { console.log(err) }
                    else { console.log("Updated succesfully.") }
                })
            } else {res.redirect('/');}
        }
    })
}


//Delete user
exports.delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        

        if (req.params.catalog == "orar" || req.params.catalog == "users") {
            res.redirect('/catalog');
        } else {
            if(req.user.admin){
                connection.query('DROP TABLE `' + req.params.catalog + '`', (err, rows) => {
                    connection.release();

                    if (!err) {
                        let removedUser = encodeURIComponent('User succesfully removed.');
                        if (req.user) {
                            res.redirect('/catalog?removed=' + removedUser);
                        } else {
                            res.redirect('/login');
                        }
                    } else {
                        console.log(err);
                    }
                })

                connection.query('DELETE FROM orar WHERE grupa = ?', [req.params.catalog], (err, ok) => {
                    if (err) { console.log(err); }
                })

                connection.query('DELETE FROM users WHERE grupa =?', [req.params.catalog], (err) => { if (err) { console.log(err) } })
            } else {res.redirect('/');}
        }
    })
}


//View users
exports.viewuser = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        

        if (req.params.catalog == "orar" || req.params.catalog == "users") {
            res.redirect('/catalog');
        } else {
            if(req.user.admin){
                connection.query('SELECT * FROM ?', [req.params.table], (err, rows) => {
                    connection.release();

                    if (!err) {
                        let removedUser = req.query.removed;
                        if (req.user) {
                            res.render('grupa-home', { rows, removedUser, title: 'cataloghome', layout: 'catalog-main' });
                        } else {
                            res.redirect('/login');
                        }
                    } else {
                        console.log(err);
                    }
                })
            } else {res.redirect('/');}
        }
    })
}

exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.jwt) {
        try {
            // 1) Verify the token. (make sure token exists, and see which user is this token from)
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            console.log(decoded);

            // 2) Check if the user still exists.
            pool.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, result) => {

                //console.log(result);

                if (!result) {
                    return next();
                }

                req.user = result[0];
                return next();
            })

        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }
} 
