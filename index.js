const express = require ("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

app.set("views", path.join(__dirname, "views"));
app.set("viewengine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

main()
    .then((res) => (console.log("Connection successful!")))
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakeWhatsapp');
}

app.get("/", (req,res) => {
    res.send("Root is working!")
});

//Index Route
app.get("/chats", asyncWrap(async(req, res, next)=> {
        let chats = await Chat.find();
        res.render("index.ejs", {chats});
    })
);

//New Route
app.get("/chats/new", (req, res) => {
    // throw new ExpressError(404, "Page Not Found!");
    res.render("new.ejs");
});

//Create Route
app.post("/chats", asyncWrap(async(req, res, next) => {
    let {from, to, msg} = req.body;
    let newChat = new Chat({
        from:from,
        to:to,
        msg:msg,
        created_on:new Date()
    });
    
    await newChat.save();
    res.redirect("/chats"); 
    })
);

function asyncWrap(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
}

//New - Show Route
app.get("/chats/:id", asyncWrap(async(req, res, next) => {
        let {id} = req.params;
        let chat = await Chat.findById(id);
        if (!chat) {
            next(new ExpressError(500, "Chat Not Found!"));
        }
        res.render("edit.ejs", {chat});
    })    
);

//Edit Route
app.get("/chats/:id/edit", asyncWrap(async(req, res, next) => {
        let {id} = req.params;
        let chat = await Chat.findById(id);
        console.log(chat);
        res.render("edit.ejs", {chat});
    })
);

//update Route
app.put("/chats/:id", asyncWrap(async(req, res, next) => {
        let {id} = req.params;
        let {msg: newMsg} = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(
        id,
        {msg: newMsg},
        {runValidators: true, new: true}
      );
      console.log(updatedChat);
      res.redirect("/chats");
    })
);

//Destroy Route
app.delete("/chats/:id", asyncWrap(async(req, res, next) => {
        let {id} = req.params;
        let deletedChat = await Chat.findByIdAndDelete(id);
        console.log(deletedChat);
        res.redirect("/chats");
    })
);

const handleValidationErr = (err) => {
    console.log("This is a validation error. Please follow the rules.");
    console.dir(err.message);
    return(err);
}

app.use((err, req, res, next) => {
    console.log(err.name);
    if(err.name === "ValidationError"){
       err = handleValidationErr(err);
    }
    next(err);
});

//Error handling Middleware
app.use((err, req, res, next) => {
    let {status = 500, message = "Some Error Occurred"} = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});