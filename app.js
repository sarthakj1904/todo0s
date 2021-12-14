const express = require("express");
const bodyParser = require("body-parser");
const alert = require("alert");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");


app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sarthak:Sandhya%40710@cluster0.uqatm.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// let today = new Date();
// let day = today.toLocaleDateString("en-US", options);

app.get("/",function(req,res){
    
    Item.find({},function(err, foundItems){
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted defaultitems to DB.");
                }
            });
            res.redirect("/");
        } else {
            res.render("index",{listTitle: "Today", newListItems : foundItems});
        }
    });
});

app.post("/",function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName == "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
    
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if(!err) {
                console.log("Deleted selected Item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate(
            {name: listName}, 
            {$pull: {items: {_id: checkedItemId}}},
            function(err, foundList) {
                if(!err) {
                    res.redirect("/" + listName);
                }
        });
    }
    
})

app.get("/:customListName", function(req, res) {
    const customListName =  _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList) {
        if(!err) {
            if(!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("index", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })

})


app.listen(3000,function(){
    console.log("Server Started on port 3000");
});
