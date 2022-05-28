const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql');
//const multer = require('multer');
//const path = require('path')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const alphanumeric = require('alphanumeric-id');

const app = express();
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());
//app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
    cors({
        origin: ['http://localhost:3000'],
        method: ['GET', 'POST'],
        credentials: true,
    })
);

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'grievance'
});

db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server');
});

app.post('/studentlogin', (req, res) => {
    const regno = req.body.regno;
    const dob = req.body.dob;
    const sqlStudentLogin = "SELECT * FROM student WHERE regno=? AND dob=?";
    db.query(sqlStudentLogin, [regno, dob], (error, result) => {
        if(error) {
            res.send({error: error});
        }
        if(result.length > 0) {
            const sno = result[0].sno;
            const sname = result[0].name;

            let jwtSecretKey = process.env.JWT_SECRET_KEY;

            const data = {
                sno: sno,
                sname: sname,
            }
            const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1m'});
            res.json({messagesuccess: 'Authenticated as '+sname, result: token});
        }
        else {
            res.send({messagefailed: 'Invalid Credentials !'});
        }
    });
});

app.get('/studenthome', (req,res) => {
    const sqlGet = 'SELECT * FROM complaint';
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});

app.post('/managementhome', (req,res) => {
    const dept = req.body.dept;
    const sqlGet = 'SELECT * FROM complaint WHERE dept=?';
    db.query(sqlGet, [dept], (error, result) => {
        if(result.length > 0) {
            res.send(result);
        }
    });
});

app.get('/adminlab', (req,res) => {
    const sqlGet = "SELECT * FROM complaint WHERE dept='Laboratory'";
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});
app.get('/adminlibrary', (req,res) => {
    const sqlGet = "SELECT * FROM complaint WHERE dept='Library'";
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});
app.get('/adminsports', (req,res) => {
    const sqlGet = "SELECT * FROM complaint WHERE dept='Sports'";
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});
app.get('/admincanteen', (req,res) => {
    const sqlGet = "SELECT * FROM complaint WHERE dept='Canteen'";
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});
app.get('/adminhostel', (req,res) => {
    const sqlGet = "SELECT * FROM complaint WHERE dept='Hostel'";
    db.query(sqlGet, (error, result) => {
        res.send(result);
    });
});


// var today = new Date(),
// date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
// var Storage = multer.diskStorage({
//     destination: 'uploads',
//     filename:(req, file, cb) => {
//         cb(null, date+file.originalname);
//     },
// });
// const fileStorage = multer.diskStorage({
    // destination: (req, file, callBack) => {
    //     callBack(null, './uploads')
    // },
//     destination: 'uploads',
//     filename: (req, file, callBack) => {
//         callBack(null, Date.now() + '-' + file.originalname);
//     },
// });

//const upload = multer({ storage: fileStorage }).single('file);

app.post('/studentcomplaint', (req, res) => {

    const title = req.body.title;
    const description = req.body.description;
    const department = req.body.department;
    const studentName = req.body.studentName;
    //var image = req.file.filename;

    if(department == 'Laboratory') {
        var complaintid = 'LB-'+alphanumeric(8);
    }
    if(department == 'Library') {
        var complaintid = 'LI-'+alphanumeric(8);
    }
    if(department == 'Sports') {
        var complaintid = 'SP-'+alphanumeric(8);
    }
    if(department == 'Canteen') {
        var complaintid = 'CTN-'+alphanumeric(8);
    }
    if(department == 'Hostel') {
        var complaintid = 'HTL-'+alphanumeric(8);
    }

    const sqlStudentComplaint = 'INSERT INTO complaint (complaintid, title, description, dept, name) VALUES (?,?,?,?,?)';
    db.query(sqlStudentComplaint,[complaintid, title, description, department, studentName],(error,result) => {
        if(error) {
            res.send({messagefailed: 'There is an error whhile uploading complaint, Please try again...!'});
        }
        else {
            res.send({messagesubmit: 'Complaint successfully submitted, keep in track...'});
        }
    });
});

app.post('/managementlogin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sqlManagementLogin = "SELECT * FROM management WHERE email=? AND password=?";
    db.query(sqlManagementLogin, [email, password], (error, result) => {
        if(error) {
            res.send({error: error});
        }
        if(result.length > 0) {
            const memail = result[0].email;
            const mdepartment = result[0].department;

            let jwtSecretKey = process.env.JWT_SECRET_KEY;

            const data = {
                memail: memail,
                mdepartment: mdepartment,
            }
            const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1m'});
            res.json({messagesuccess: 'Authentication Successful', result: token});
        }
        else {
            res.send({messagefailed: 'Invalid Credentials !'});
        }
    });
});

app.post('/adminlogin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sqlAdminLogin = 'SELECT * FROM admin WHERE email=? AND password=?';
    db.query(sqlAdminLogin, [email, password], (error, result) => {
        if(error) {
            res.send({error: error});
        }
        if(result.length > 0) {
            const aemail = result[0].email;

            let jwtSecretKey = process.env.JWT_SECRET_KEY;

            const data = {
                aemail: aemail,
            }
            const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1m'});
            res.json({messagesuccess: 'Authentication Successful', result: token});
        }
        else {
            res.send({messagefailed: 'Invalid Credentials !'});
        }
    });
});

let PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Server is running on',+PORT);
});