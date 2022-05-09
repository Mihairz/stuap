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

//Add admin
exports.registerAdmin = (req, res) => {
    if (req.user) {
        if (req.user.admin) {
            res.render('register-admin', { user: req.user, title: 'register-layout', layout: 'profile-auth' });
        } else {
            res.redirect('/profile', { title: 'profile-layout', layout: 'profile-auth' });
        }
    } else {
        res.redirect('/login');
    }
}

//View Admins
exports.view = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query('SELECT * FROM users WHERE admin = 1', (err, rows) => {
            connection.release();

            if (!err) {
                let removedUser = req.query.removed;

                if (req.user) {
                    if (req.user.admin) {
                        res.render('admini-home', { rows, removedUser, title: 'adminihome', layout: 'admini-main' });
                    } else {
                        res.redirect('/profile');
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

//Find admin by search
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        let searchTerm = req.body.search;

        connection.query('SELECT * FROM users WHERE (name LIKE ? OR prenume LIKE ? OR email LIKE ? OR telefon LIKE ?) AND (admin = 1)', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            if (!err) {
                if (req.user) {
                    res.render('admini-home', { rows });
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

//Delete admin
exports.deleteAdmin = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log('Connected as ID ' + connection.threadId);
        if(req.user.admin){
            connection.query('DELETE FROM users WHERE email = ?', [req.params.email], (err, rows) => {

                connection.release();

                if (!err) {
                    if (req.user) {
                        let removedUser = encodeURIComponent('succesfullyRemoved');
                        res.redirect('/admini?removed=' + removedUser);
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