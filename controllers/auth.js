const mysql = require('mysql');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login',
                { message: 'Please provide both email and password.', title: 'login-return', layout: 'profile-auth' })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {

            if (!results[0] || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', { message: 'Email or Password is incorrect', title: 'login-return', layout: 'profile-auth' })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })

                console.log("The token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions)
                res.status(200).redirect('/');
            }
        }
        )
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    const { facultate, grupa, name, prenume, email, password, passwordConfirm } = req.body;

    if (!facultate || !grupa || !name || !prenume || !email || !password || !passwordConfirm) {
        return res.render('register', {
            message: 'Te rog sa introduci toate datele necesare.'
        })
    } else {

        const grupaLowercaseFaraSpatii = (grupa.replace(/ +/g, '')).toLowerCase();

        db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.log(error);
            }

            if (results.length > 0) {
                return res.render('register', {
                    message: 'Email is already taken'
                })
            }
            else if (password !== passwordConfirm) {
                return res.render('register', {
                    message: 'Passwords do not match.'
                })
            }

            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);

            db.query('INSERT INTO users SET ?', { facultate: facultate, grupa: grupaLowercaseFaraSpatii, name: name, prenume: prenume, email: email, password: hashedPassword },
                (error, results) => {
                    if (error) { console.log(error) }
                    else {
                        return res.render('register', {
                            succesMessage: 'User registered succesfully.'
                        })
                    }
                }
            )

            db.query('SELECT * FROM orar WHERE grupa = ?', [grupaLowercaseFaraSpatii], (error, results) => {
                if (!error) {

                    if (results.length == 0) {

                        db.query('INSERT INTO orar SET facultate = ?, grupa =?', [facultate, grupaLowercaseFaraSpatii], (err) => {
                            if (err) { console.log(err) }
                        })

                        db.query('CREATE TABLE `' + grupaLowercaseFaraSpatii + '` ( `id` INT NOT NULL AUTO_INCREMENT ,`grupa` VARCHAR(10) NOT NULL,`nume` VARCHAR(10) NOT NULL , `prenume` VARCHAR(30) NOT NULL ,`email` VARCHAR(30) NOT NULL, `note` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB; ', (err) => {
                            if (err) { console.log(err) }
                        })
                    }

                } else (console.log(error))
            })
        })
    }
}

exports.registerAdmin = (req, res) => {
    const { nume, prenume, email, password, passwordConfirm } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [req.params.email], (err, rows) => {

        if (err) { console.log(err) }
        else {
            if (!nume || !prenume || !email || !password || !passwordConfirm) {
                return res.render('register-admin', { user: rows[0], message: 'Te rog sa introduci toate datele necesare.', title: 'register-layout', layout: 'profile-auth' })
            } else {

                db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
                    if (error) {
                        console.log(error);
                    }

                    if (results.length > 0) {
                        return res.render('register-admin', { user: rows[0], message: 'Email is already taken', title: 'register-layout', layout: 'profile-auth' })
                    }
                    else if (password !== passwordConfirm) {
                        return res.render('register-admin', { user: rows[0], message: 'Passwords do not match.', title: 'register-layout', layout: 'profile-auth' })
                    }

                    let hashedPassword = await bcrypt.hash(password, 8);
                    console.log(hashedPassword);

                    db.query('INSERT INTO users SET ?', { name: nume, prenume: prenume, email: email, password: hashedPassword, admin: 1 },
                        (error, results) => {
                            if (error) { console.log(error) }
                            else {
                                return res.render('register-admin', { user: rows[0], succesMessage: 'New admin registered succesfully.', title: 'register-layout', layout: 'profile-auth' })
                            }
                        }
                    )
                })
            }
        }
    })
}

const { promisify } = require('util');

exports.isLoggedIn = async (req, res, next) => {

    //console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            // 1) Verify the token. (make sure token exists, and see which user is this token from)
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            console.log(decoded);

            // 2) Check if the user still exists.
            db.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, result) => {

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

exports.logout = async (req, res) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
}
