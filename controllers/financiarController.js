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
        console.log('Connected as ID ' + connection.threadId);

        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", ['stuap'], (err, rows) => {

            connection.release();

            for (var key in rows) {
                if (rows[key].TABLE_NAME == "orar" || rows[key].TABLE_NAME == "users") {
                    delete rows[key];
                }
            }

            if (!err) {
                let removedUser = req.query.removed;
                if (req.user) {
                    if (req.user.admin) {
                        res.render('financiar-home', { rows, removedUser, title: 'financiarhome', layout: 'financiar-main' });
                    } else {
                        res.redirect('/student-financiar/' + req.user.grupa + '/' + req.user.email);
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
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE ?", ['stuap', '%' + searchTerm + '%'], (err, rows) => {

            connection.release();

            for (var key in rows) {
                if (rows[key].TABLE_NAME == "orar" || rows[key].TABLE_NAME == "users") {
                    delete rows[key];
                }
            }

            if (!err) {
                if (req.user) {
                    res.render('financiar-home', { rows, title: 'financiarfind', layout: 'financiar-main' });
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

        if (req.params.financiar == "orar" || req.params.financiar == "users") {
            res.redirect('/financiar');
        } else {

            connection.query('SELECT * FROM ?', [req.params.table], (err, rows) => {
                connection.release();

                if (!err) {
                    let removedUser = req.query.removed;
                    if (req.user) {
                        res.render('grupa-home', { rows, removedUser, title: 'financiarhome', layout: 'financiar-main' });
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
