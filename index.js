import Express  from "express";
import cors from 'cors'
import mongoose from 'mongoose';
let app=Express();
let port=80;
app.use(cors());
app.use(Express.json());
mongoose.connect("mongodb+srv://root:root@cluster0.ptrwhf1.mongodb.net/FindMyBuddy").then(()=>{
    console.log("Database Connected")});

let credentialSchema= new mongoose.Schema({
    Name:String,
    userName:String,
    Email:String,
    Number:String,
    Password:String
})
let schoolSchema= new mongoose.Schema({
    userName:String,
    schoolName:String
})

let credentials= new mongoose.model("credentials",credentialSchema)
let schools= new mongoose.model("schools",schoolSchema)

app.post("/getSchool",(req,res)=>{
    let username=req.body.username;
    schools.find({userName:username}).then(data=>{
        let schoollist=data.map(detail=>detail.schoolName)
        res.send(schoollist);
    })
})

app.post("/getBuddy",(req,res)=>{
    let schoolname=req.body.school;
    schools.find({schoolName:schoolname}).then(async (data)=>{
        let userlist=data.map(detail=>detail.userName)
        let userDataPromises=userlist.map(async (user)=>{
            let data= await credentials.findOne({userName:user})
            return data;
        })
        let userData= await Promise.all(userDataPromises)
        res.send(userData);
    })
})
app.post("/addSchool",(req,res)=>{
    let username=req.body.username;
    let schoolname=req.body.school;
    schools.create({userName:username,schoolName:schoolname}).then(()=>{
        res.sendStatus(200);
    })
})

app.post("/login",(req,res)=>{
    let user=req.body.username;
    let pass=req.body.password;
    credentials.find({userName:user})
    .then((data)=>{

        if(data.length==1)
        {
            if(data[0].Password==pass)
            {
                res.send({
                    "found":true,
                    "match":true,
                    "name":data[0].Name,
                    "username":data[0].userName,
                    "email":data[0].Email,
                    "number":data[0].Number
                })
            }
            else
            res.send({
                "found":true,
                "match":false
            })  //Forbidden, incorrect password, try again.
        }
        else
        {
            res.send({
                "found":false,
                "match":false
            }) //Not Found, User not found , redirect to signup page.
        }
    })
    .catch(e=>{console.log(e)
        res.sendStatus(500); //Internal error
    })
})
app.post("/addUser",(req,res)=>{
    let name=req.body.name;
    let username=req.body.username;
    let email=req.body.email;
    let number=req.body.number;
    let password=req.body.password;
    credentials.find({userName:username}).then(data=>{

        if(data.length!=0)
        {
            res.send(false);
        }
        else
        {
            credentials.create({Name:name,userName:username,Email:email,Number:number,Password:password}).then(()=>{
                res.send(true);
            })
            
        }
    }).catch(e=>console.log(e))


})
app.listen(port,()=>{
    console.log("Server Started");
})