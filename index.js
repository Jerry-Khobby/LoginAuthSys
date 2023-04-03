const express =require("express");
const app = express();
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./models/userModel");
const ejs = require('ejs');



//my middle wares into the codes 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    secret:"Your secret key",
    saveUninitialized:true,
    resave:false,
}));
app.set('view engine', 'ejs');
//before using the messages in the response object we have to use the message middleware.
app.use((req, res, next) => {
    res.locals.messages = { error: null };
    next();
  });


  const isAuthenticated=(req,res,next)=>{
    if(req.session&&req.session.user){
      return next();
    }else{
      return res.redirect('/login');
    }
  }

  
  




const PORT = process.env.PORT || 4000;
const connection_url ='mongodb+srv://Jeremiah:gyamfi@cluster0.kohtr76.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(connection_url,{
    useNewUrlParser:true,
});

//After setting up the thing mongoose connections, we have to catch errors 

const db = mongoose.connection;
db.on("error",(error)=>{
    console.log(error)
});
db.once("open",()=>{
    console.log("The database has been connected successfully");
});


{/** all my routes will fall under this portions onwards 
initial routes
*/}
app.get('/',isAuthenticated,(req,res)=>{
    res.render("index.ejs");
})
app.get('/register',(req,res)=>{
    res.render('register.ejs');
})

app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

/** the post method routes  */
//for pushing data,when it is an array, you use the push to get the things done but when its mongodb you will use the straight save command
 app.post("/register",async(req,res)=>{
    try{
        const newHashed = await bcrypt.hash(req.body.password,10);
        const newUser = new User({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:newHashed,
        });

        await newUser.save();
        console.log(newUser);
        res.redirect("/login");

    }catch(e){
        console.log(e);
        res.redirect("/register");
    }
 })

//we use try and catch in this format.
 
 app.post("/login", async (req, res) => {
    try {
      //console.log(req.body);
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
       // console.log("run6");
        return res.render("login", 
        {
          messages:{
            error:"Invalid Credentials",
          },
        });
      }
      //console.log(await bcrypt.compare(req.body.password, user.password));
      if (await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = user;
        console.log("run")
        
        return res.redirect("/");
      } else {
        //console.log("run2");
        return res.render("login", {
          messages:{
            error:"Invalid Credentials",
          },
        });
      }
    } catch (e) {
      //console.log("run1");
      console.log(e);
      return res.redirect("/login");
    }
   
  });
  

  










app.listen(PORT,()=>{
    console.log('The server is listening on port 4000');
});