const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-Rythm:test123@cluster0.y0rl4.mongodb.net/todolistDB");

const todolistSchema={
  name: String
};

const Item=mongoose.model("Item",todolistSchema);

const item1=new Item({
  name:"Welcome to the todolist"
});

const item2=new Item({
  name:"Press + to add the task"
});

const item3=new Item({
  name:"Tick the checkbox to delete the task"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  listItems:[todolistSchema]
};

const List = mongoose.model("list",listSchema);


var items = [];
var workItems = [];

var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long"
}

var day = today.toLocaleDateString("en-IN", options);


app.get("/", function(req, res) {


  Item.find({},function (err,results) {
    if(err){
      console.log(err);
    }
    // if(results.length===0){
    //   Item.insertMany(defaultItems,function(err){
    //     if(err){
    //       console.log(err);
    //     }
    //     else{
    //       console.log("Items inserted")
    //     }
    //   });
    //   res.redirect("/");
    // }
    // else{
      res.render("list", {
        listType: day,
        newListItem: results
      });
    // }
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName=req.body.button;
  const itemAdded=new Item({
    name: itemName
  });

  if(listName===day){
    itemAdded.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.listItems.push(itemAdded);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/remove",function(req,res){
  const toRemove=req.body.checkbox;
  const listName=req.body.listType;
  if(listName===day){
    Item.findByIdAndRemove(toRemove,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item deleted successfully")
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{listItems:{_id:toRemove}}},function(err,foundlist){
      if(!err){
        console.log("Successfully Deleted the item");
        res.redirect("/"+listName);
      }
    });
  }



});


app.get("/:userRoute",function(req,res){
  const customListName=_.capitalize(req.params.userRoute);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list=new List({
          name: customListName,
          listItems: []
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // Show existing list
        res.render("list",{listType: foundList.name,newListItem: foundList.listItems})
      }
    }
  });

});
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listType: "Work",
//     newListItem: workItems
//   })
// });

// app.post("/work",function(req,res){
//   let item=req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });



app.listen(3000, function() {
  console.log("Server started at port 3000");
});
