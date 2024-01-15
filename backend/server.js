const express = require('express');
const mongoose = require('mongoose');                                                //mongoose act as a frontend to mongoDB
const app = express();
const bcrypt = require('bcrypt');                                                     //helps in encoding when we store the password in hash function(A way to ensure data and here the password)
const Student = require('./models/Student.js');
const path = require('path');
const cookieParser = require('cookie-parser');                                            //used to deal with cookies,   Extracts the cookie data from the HTTP request and converts it into a usable format that can be accessed by the server-side code
const session = require('express-session');                                              //we get the session id in form of cookies 
const cors = require('cors');                              
mongoose.connect('mongodb://127.0.0.1:27017/StudentsApi');

app.use(express.json());                                                                     //everthing goes in form of string and we want it to come in form of json object   (json-javascript object notation)
app.use(express.urlencoded());                                                              // login, signup are forms so the data thats comes from these forms is with the help of this
app.use(cookieParser());
app.use(session({
    secret: 'Please say hello',        
}));
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/register',(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
})

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
})
app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
})


app.post('/register' ,async (req,res) => {
    const user = req.body;
    if(!user.password || !user.username){
        res.send("Username and Password are required");
        return;
    }
    if(user.password.length < 4) {
        res.send("Password Length must be greator than or equal to 4");
        return;
    }

    const newUser = new Student(user);                                                          //using schema here ,the model we created we added our new user ,Now our new user is added
    const saltRounds = 10;                                                                    //dictates how many times we perform the hashing process,more security but more time
    const hashedPwd = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPwd;
    try{
        await newUser.save(); 
    } catch(err) {
        res.send("Couldn't Register Account");
    }
    res.redirect('/login');
})

app.post('/login',async (req,res) => {
    const loginData = req.body;

    const account = (await Student.find().where('username').equals(loginData.username))[0];
    if(!account) {
        res.send("User Name not found");
        return;
    }
    const match = await bcrypt.compare(loginData.password, account.password);
    if(!match) {
        return res.send("Incorrent Password");
    }
    req.session.user = account;
    req.session.loggedIn = true;
    res.redirect('/user');
})

app.get('/user/',(req,res) => {                                                             //if logged in then direct to student else login page
    const loggedIn = req.session.loggedIn;
    if(loggedIn) {
        res.sendFile(path.join(__dirname,'../frontend/students.html'));
    }else{
        res.redirect('/login');
    }
    
})

app.get('/studentsDetails', async (req,res) => {
    try {
        const students = await Student.find({}, 'username');
        res.json(students);
    }catch (err) {
        console.log(err);
        res.status(500).json({error : ' Error'});
    }
});

app.get('/studentsDetails/:username', async (req,res) => {
    const requiredUser = req.params.username;
    try {
        const student = await Student.findOne({username: requiredUser});
        if(!student){
            return res.status(404).send("No Data found for entered username");
        }
        res.json(student);
    }
    catch(err) {
        console.log(err);
        res.status(400).json({error : "Internal Server Error"});
    }
} )

app.delete('/studentsDetails/:id', async (req,res) => {
    const id = req.params.id;
    try{
        await Student.findByIdAndDelete(id);
        res.status(200).send("Student Deleted");
    }catch(err) {
        console.log(err);
        res.status(400).send("Couldn't Delete Student");
    }
})


app.put('/studentsDetails/:id/:input', async (req,res) => {
    const id = req.params.id;
    const newusername = req.params.input;
    try {
        const updateStudent = await Student.findByIdAndUpdate(
            id,
            {username: newusername},
            {new:true}
        );
        res.status(200).send("Student Updated");
        if(!updateStudent){
            res.status(404).send("Studnet not found");
        }
    }catch(err) {
        console.log(err);
        res.status(400).send("Update Unsuccessfull");
    }
})


app.listen(3000 ,() => {
    console.log("Server Started At: http://localhost:3000");
})