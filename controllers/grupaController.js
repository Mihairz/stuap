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
const bcrypt = require('bcryptjs');

//view users
exports.view = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        const intero = ("SELECT * FROM ");
        const interogatie = intero + req.params.grupa;

        connection.query(interogatie, (err, rows) => {
            connection.release();

            if (!err) {
                let removedUser = req.query.removed;
                let grupamea = req.params.grupa;
                if (req.user) {
                    res.render('grupa-home', { rows, removedUser, grupamea, title: 'grupahome', layout: 'grupa-main' });
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
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;
        interogatie = ("SELECT * FROM " + req.params.grupa + " WHERE nume LIKE ? OR prenume LIKE ?");

        connection.query(interogatie, ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            if (!err) {
                let grupamea = req.params.grupa;
                if (req.user) {
                    res.render('grupa-home', { rows, grupamea, title: 'grupafind', layout: 'grupa-main' });
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
    const grupamea = req.params.grupa;
    if (req.user) {
        res.render('grupa-add', { grupamea, title: 'grupaadd', layout: 'grupa-main' });
    }
}

//Add new user
exports.create = (req, res) => {

    const { nume, prenume, email, note, financiar, password, passwordConfirm } = req.body;
    const grupamea = req.params.grupa;

    pool.getConnection((err, connection) => {
        if (err) throw err; 
        console.log('Connected as ID ' + connection.threadId);
        connection.release();

        let searchTerm = req.body.search;

        if (!nume || !prenume || !email || !password || !passwordConfirm) {
            res.render('grupa-add', { grupamea, message: 'Te rog sa introduci toate datele necesare.', title: 'grupanew', layout: 'grupa-main' })
        } else {
            connection.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
                if (error) {
                    console.log(error);
                }

                if (results.length > 0) {
                    res.render('grupa-add', { grupamea, message: 'Email is already taken', title: 'grupanew', layout: 'grupa-main' })
                }
                else if (password !== passwordConfirm) {
                    res.render('grupa-add', { grupamea, message: 'Passwords do not match.', title: 'grupanew', layout: 'grupa-main' })
                } else {

                    let hashedPassword = await bcrypt.hash(password, 8);
                    console.log("Hashed password: ", hashedPassword);


                    connection.query('INSERT INTO ' + req.params.grupa + ' SET grupa = ?, nume =?, prenume = ?, email = ?, note = ?, financiar = ?', [req.params.grupa, nume, prenume, email, note, financiar], (err, rows) => { if (err) { console.log(err) } })

                    connection.query('SELECT * FROM orar WHERE grupa = ?', [req.params.grupa], (err, results) => {
                        if (err) { console.log(err) }
                        else {
                            connection.query('UPDATE ' + req.params.grupa + ' SET facultate = ? WHERE email = ?', [results[0].facultate, email], (err) => {
                                if (err) { console.log(err) }
                            })

                            connection.query('INSERT INTO users SET ?', { facultate: results[0].facultate, grupa: req.params.grupa, name: nume, prenume: prenume, email: email, password: hashedPassword },
                                (error, results) => {
                                    if (error) { console.log(error) }
                                    else {
                                        if (req.user) {
                                            res.render('grupa-add', { grupamea, alert: 'Student ' + nume + ' ' + prenume + ' has been added succesfully.', title: 'grupanew', layout: 'grupa-main' });
                                        } else {
                                            res.redirect('/login');
                                        }
                                    }
                                }
                            )
                        }
                    })
                }
            })
        }
    })
}

//Edit user
exports.edit = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        const interogatie = ('SELECT * FROM ' + req.params.grupa + ' WHERE email = ?');

        connection.query(interogatie, [req.params.email], (err, rows) => {

            connection.release();

            if (!err) {
                const grupamea = req.params.grupa;
                if (req.user) {
                    res.render('grupa-edit', { rows, grupamea, title: 'grupaedit', layout: 'grupa-main' });
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
    const { nume, prenume, email, note, financiar, password, passwordConfirm } = req.body;

    if (!nume || !prenume || !email) {

        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log('Connected as ID ' + connection.threadId);

            const interogatie = ('SELECT * FROM ' + req.params.grupa + ' WHERE email = ?');

            connection.query(interogatie, [req.params.email], (err, rows) => {

                connection.release();

                if (!err) {
                    const grupamea = req.params.grupa;
                    if (req.user) {
                        res.render('grupa-edit', { rows, message: 'Nume, prenume și email sunt cămpuri obligatorii.', grupamea, title: 'grupaedit', layout: 'grupa-main' });
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    console.log(err);
                }
            })
        })

    } else {

        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log('Connected as ID ' + connection.threadId);

            connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
                if (error) {
                    console.log(error);
                }

                if (results.length == 1) {

                    if(email !== req.params.email){
                        connection.query('SELECT * FROM ' + req.params.grupa + ' WHERE email = ?', [req.params.email], (err, rows) => {

                            connection.release();
    
                            if (!err) {
                                const grupamea = req.params.grupa;
                                if (req.user) {
                                    res.render('grupa-edit', { rows, grupamea, message: 'Email already taken', title: 'grupaupdate', layout: 'grupa-main' });
                                } else {
                                    res.redirect('/login');
                                }
                            } else {
                                console.log(err);
                            }
                        })
                    }  
                    else if (password !== passwordConfirm) {
                        connection.query('SELECT * FROM ' + req.params.grupa + ' WHERE email = ?', [req.params.email], (err, rows) => {

                            connection.release();

                            if (!err) {
                                const grupamea = req.params.grupa;
                                if (req.user) {
                                    res.render('grupa-edit', { rows, grupamea, message: 'Passwords do not match.', title: 'grupaupdate', layout: 'grupa-main' });
                                } else {
                                    res.redirect('/login');
                                }
                            } else {
                                console.log(err);
                            }
                        })
                    } else {
                        let hashedPassword = await bcrypt.hash(password, 8);
                        console.log("Hashed password: ", hashedPassword);


                        connection.query('UPDATE users SET name= ?,prenume = ?,email= ?,password = ? WHERE email = ?', [nume, prenume, email, hashedPassword, req.params.email], (err) => { if (err) { console.log(err) } })

                        connection.query('UPDATE ' + req.params.grupa + ' SET grupa= ?,nume= ?,prenume = ?,email= ?,note= ?,financiar = ? WHERE email = ?', [req.params.grupa, nume, prenume, email, note, financiar, req.params.email], (err, rows) => {

                            connection.release();

                            if (!err) {
                                pool.getConnection((err, connection) => {
                                    if (err) throw err;
                                    console.log('Connected as ID ' + connection.threadId);


                                    connection.query('SELECT * FROM ' + req.params.grupa + ' WHERE email = ?', [req.params.email], (err, rows) => {

                                        connection.release();

                                        if (!err) {
                                            const grupamea = req.params.grupa;
                                            if (req.user) {
                                                res.render('grupa-edit', { rows, grupamea, alert: 'Student ' + nume + ' ' + prenume + ' has been updated succesfully.', title: 'grupaupdate', layout: 'grupa-main' });
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
                    }
                }
            })
        })
    }
}

//Delete user
exports.delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        connection.query('DELETE FROM users WHERE email = ?', [req.params.email], (err) => { if (err) { console.log(err) } })

        const interogatie = ('DELETE FROM ' + req.params.grupa + ' WHERE email = ?');

        connection.query(interogatie, [req.params.email], (err, rows) => {

            connection.release();

            if (!err) {
                grupamea = req.params.grupa;
                let removedUser = encodeURIComponent('succesfullyRemoved');
                if (req.user) {
                    res.redirect('/grupa/' + grupamea + '?removed=' + removedUser);
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })
    })
}

//View users
exports.viewuser = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);

        const interogatie = ('SELECT * FROM ' + req.params.grupa + ' WHERE id = ?');

        connection.query(interogatie, [req.params.id], (err, rows) => {

            connection.release();

            if (!err) {
                grupamea = req.params.grupa;
                if (req.user) {
                    res.render('grupa-view', { rows, grupamea, title: 'grupaview', layout: 'grupa-main' });
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
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