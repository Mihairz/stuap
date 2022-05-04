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

//view users
exports.view = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        connection.query('SELECT * FROM orar', (err, rows) => {

            connection.release();

            if (!err) {
                let removedUser = req.query.removed;

                if (req.user) {
                    if (req.user.admin) {
                        res.render('orar-home', { rows, removedUser, title: 'orarhome', layout: 'orar-main' });
                    } else {
                        res.redirect('/student-orar/' + req.user.grupa);
                    }
                }
                else {
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
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        connection.query('SELECT * FROM orar WHERE facultate LIKE ? OR grupa LIKE ? OR profesor_coordonator LIKE ? ', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            if (!err) {
                if (req.user) {
                    res.render('orar-home', { rows, title: 'orarfind', layout: 'orar-main' });
                }
                else {
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
        res.render('orar-add', { title: 'oraradd', layout: 'orar-main' });
    }
    else {
        res.redirect('/login');
    }
}

//Add new user
exports.create = (req, res) => {
    const { facultate, grupa, profesor_coordonator, email_profesor_coordonator, telefon_profesor_coordonator, orar } = req.body;

    if (!facultate || !grupa || !profesor_coordonator || !email_profesor_coordonator || !telefon_profesor_coordonator || !orar) {
        res.render('orar-add', { eroare: 'Te rog sa introduci toate datele necesare.', title: 'orarnew', layout: 'orar-main' });
    } else {

        const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log('Connected as ID ' + connection.threadId);

            let searchTerm = req.body.search;

            connection.query('INSERT INTO orar SET facultate = ?, grupa =?, profesor_coordonator = ?, email_profesor_coordonator = ?, telefon_profesor_coordonator = ?, orar = ?', [facultate, grupaLowercaseFaraSpatii, profesor_coordonator, email_profesor_coordonator, telefon_profesor_coordonator, orar], (err, rows) => {

                connection.release();

                if (!err) {
                    if (req.user) {
                        res.render('orar-add', { alert: 'Grupa ' + grupaLowercaseFaraSpatii + ' has been added succesfully.', title: 'orarnew', layout: 'orar-main' });
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    console.log(err);
                }
            })

            //Creeaza automat tabel cu grupa pentru baza de date
            connection.query('CREATE TABLE `' + grupaLowercaseFaraSpatii + '` ( `id` INT NOT NULL AUTO_INCREMENT ,`grupa` VARCHAR(10) NOT NULL,`facultate` VARCHAR(10) NOT NULL ,`nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL ,`email` VARCHAR(30) NOT NULL,`telefon` VARCHAR(10) NOT NULL, `note` TEXT(255) NOT NULL ,`financiar` TEXT(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB; ', (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Tabel creat.")
                }
            })

            connection.query("INSERT INTO facultati SET facultate = ?", [facultate], (err) => { if (err) { console.log(err) } })
        })
    }
}

//Edit user
exports.edit = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        connection.query('SELECT * FROM orar WHERE grupa = ?', [req.params.grupa], (err, rows) => {

            connection.release();

            if (!err) {
                if (req.user) {
                    res.render('orar-edit', { rows, title: 'oraredit', layout: 'orar-main' });
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })
    })
}

//Update user
exports.update = (req, res) => {
    const { facultate, grupa, profesor_coordonator, email_profesor_coordonator, telefon_profesor_coordonator, orar } = req.body;

    if (!facultate || !grupa || !profesor_coordonator || !email_profesor_coordonator || !telefon_profesor_coordonator || !orar) {

        pool.getConnection((err, connection) => {
            connection.query('SELECT * FROM orar WHERE grupa = ?', [req.params.grupa], (errr, rows) => {

                connection.release();

                if (!errr) {
                    if (req.user) {
                        res.render('orar-edit', { rows, eroare: 'Te rog sa introduci toate datele necesare.', title: 'orarupdate', layout: 'orar-main' });
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    console.log(err);
                }
            })
        })

    } else {
        const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

        pool.getConnection((err, connection) => {
            if (err) throw err;
            //console.log('Connected as ID ' + connection.threadId);

            connection.query('UPDATE orar SET facultate= ?,grupa= ?,profesor_coordonator= ?,email_profesor_coordonator= ?,telefon_profesor_coordonator= ?,orar= ? WHERE id = ?', [facultate, grupaLowercaseFaraSpatii, profesor_coordonator, email_profesor_coordonator, telefon_profesor_coordonator, orar, req.params.id], (err, rows) => {

                connection.release();

                if (!err) {
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        console.log('Connected as ID ' + connection.threadId);

                        connection.query('SELECT * FROM orar WHERE grupa = ?', [req.params.grupa], (errr, rows) => {

                            connection.release();

                            if (!errr) {
                                if (req.user) {
                                    res.render('orar-edit', { rows, alert: 'Grupa ' + grupaLowercaseFaraSpatii + ', from ' + facultate + ' has been updated.', title: 'orarupdate', layout: 'orar-main' });
                                } else {
                                    res.redirect('/login');
                                }
                            } else {
                                console.log(err);
                            }
                        })
                    })
                } else {
                    console.log(err);
                }
            })

            connection.query('UPDATE ' + req.params.grupa + ' SET grupa =?', [grupaLowercaseFaraSpatii], (err) => { if (err) { console.log(err) } })
            connection.query('UPDATE users SET grupa=? WHERE grupa = ?', [grupaLowercaseFaraSpatii, req.params.grupa], (err) => { if (err) { console.log(err) } })
            connection.query('ALTER TABLE ' + req.params.grupa + ' RENAME TO ' + grupaLowercaseFaraSpatii, (err) => { if (err) { console.log(err) } })
        })
    }
}

//Delete user
exports.delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        connection.query('DELETE FROM orar WHERE id = ?', [req.params.id], (err, rows) => {

            connection.release();

            if (!err) {
                if (req.user) {
                    let removedUser = encodeURIComponent('succesfullyRemoved');
                    res.redirect('/orar?removed=' + removedUser);
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })

        connection.query('DELETE FROM users WHERE grupa=?', [req.params.grupa], (err) => { if (err) { console.log(err) } })

        connection.query(' DROP TABLE `' + [req.params.grupa] + '` ', (err, ok) => {
            if (err) { console.log(err); }
        })
    })
}

//View users
exports.viewuser = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        connection.query('SELECT * FROM orar WHERE grupa = ?', [req.params.grupa], (err, rows) => {

            connection.release();

            if (err) { console.log(err) }
            else {
                connection.query('SELECT * FROM users WHERE grupa = ?', [req.params.grupa], (errr, studenti) => {
                    if (err) { console.log(errr) }
                    else {
                        if (req.user) {
                            if (req.user.admin) {
                                res.render('orar-view', { rows, studenti, title: 'orarview', layout: 'orar-main' });
                            } else {
                                res.redirect('/student-orar/' + req.params.grupa);
                            }
                        }
                        else {
                            res.redirect('/login');
                        }
                    }
                })
            }
        })
    })
}

exports.isLoggedIn = async (req, res, next) => {

    //console.log(req.cookies);
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
