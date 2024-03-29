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

exports.view = (req, res) => {
    if (req.user) {
        res.render('profile', { user: req.user, title: 'profile-layout', layout: 'profile-auth' });
    } else {
        res.redirect('/login');
    }
}

exports.edit = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rows) => {

            connection.release();

            if (!err) {
                if (req.user) {
                    res.render('profile-edit', { rows, user: req.user, title: 'profiledit', layout: 'profile-auth' });
                } else {
                    res.redirect('/login');
                }
            } else {
                console.log(err);
            }
        })
    })
}

exports.update = (req, res) => {
    const { nume, prenume, email, telefon, password, passwordConfirm } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;

        if (!nume || !prenume || !email) {
            connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rows) => {

                if (!err) {
                    if (req.user) {
                        res.render('profile-edit', { rows, user: req.user, eroare: 'Nume, prenume și email sunt cămpuri obligatorii.', title: 'profiledit', layout: 'profile-auth' });
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    console.log(err);
                }
            })
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], async (error, rows) => {
                if (error) {
                    console.log(error);
                }

                connection.query('SELECT * FROM users WHERE email = ?',[email],async (error, results)=>{
                    if(results.length == 1){
                        if(email !== req.params.email){
                            if (req.user) {
                                res.render('profile-edit', { rows, user: req.user, eroare: 'Email already taken.', title: 'profiledit', layout: 'profile-auth' });
                            } else {
                                res.redirect('/login');
                            }                        
                        }
                        else if (password != passwordConfirm){
                            if (req.user) {
                                res.render('profile-edit', { rows, user: req.user, eroare: 'Passwords do not match.', title: 'profiledit', layout: 'profile-auth' });
                            } else {
                                res.redirect('/login');
                            }                           
                        } else {
                            let hashedPassword = await bcrypt.hash(password, 8);
                            console.log("Hashed password: ", hashedPassword);
        
                            connection.query('UPDATE users SET name = ?, prenume = ?, email = ?, telefon = ?, password = ? WHERE email = ?', [nume, prenume, email, telefon,hashedPassword,req.params.email], (err, rows) => {
                                connection.release();
                                if (err) { console.log(err) }
                            })
        
                            if(rows[0].admin == 0){
                                connection.query('UPDATE ' + rows[0].grupa + ' SET nume= ?,prenume = ?,email= ?,telefon = ? WHERE email = ?', [nume, prenume, email,telefon,req.params.email], (err, rows) => {
                                    if(err){console.log(err)}
                                    else {
                                        connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rowss) => {
                                            if (!err) {
                                                if (req.user) {
                                                    res.render('profile-edit', { rowss, user: req.user, alert: 'Editat cu succes.', title: 'profiledit', layout: 'profile-auth' });
                                                } else {
                                                    res.redirect('/login');
                                                }
                                            } else {
                                                console.log(err);
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    } else {
                        if (password != passwordConfirm){
                            if (req.user) {
                                res.render('profile-edit', { rows, user: req.user, eroare: 'Passwords do not match.', title: 'profiledit', layout: 'profile-auth' });
                            } else {
                                res.redirect('/login');
                            }                           
                        } else {
                            let hashedPassword = await bcrypt.hash(password, 8);
                            console.log("Hashed password: ", hashedPassword);
        
                            connection.query('UPDATE users SET name = ?, prenume = ?, email = ?, telefon = ?, password = ? WHERE email = ?', [nume, prenume, email, telefon,hashedPassword,req.params.email], (err, rows) => {
                                connection.release();
                                if (err) { console.log(err) }
                            })
        
                            if(rows[0].admin == 0){
                                connection.query('UPDATE ' + rows[0].grupa + ' SET nume= ?,prenume = ?,email= ?,telefon = ? WHERE email = ?', [nume, prenume, email,telefon,req.params.email], (err, rows) => {
                                    if(err){console.log(err)}
                                    else {
                                        connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rowss) => {
                                            if (!err) {
                                                if (req.user) {
                                                    res.render('profile-edit', { rowss, user: req.user, alert: 'Editat cu succes.', title: 'profiledit', layout: 'profile-auth' });
                                                } else {
                                                    res.redirect('/login');
                                                }
                                            } else {
                                                console.log(err);
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    }
                })
                
            })
        }
    })
}

exports.visit = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) { console.log(err); }
        else {
            connection.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rows) => {
                if (!err) {
                    if (req.user) {
                        res.render('profile-visit', { rows, user: req.user, title: 'profiledit', layout: 'profile-auth' });
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    console.log(err);
                }
            })
        }
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