const express = require("express");
const mongoose = require("mongoose");
const path = require('path');

const app = express();

// Built-In Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

// Database Server MongoDb Setup

mongoose
  .connect("mongodb://127.0.0.1:27017/from-scratch", { useNewUrlParser: true })
  .then(() => console.log("Connected! to mongodb port 27017"));

// Defining a Model
// Models are defined through the Schema interface.

const Schema = mongoose.Schema;

const BlogPost = new Schema({
  title: String,
  body: String,
  date: Date,
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "Name cannot be blank!",
    },
    instructions: {
      type: String,
      required: "Instructions cannot be blank!",
    },
    ingredients: {
      type: [String],
      default: [],
    },
    img: {
      type: String,
      required: "Image cannot be blank!",
    },
    isLogged: {
      type: Boolean,
      default: false,
    },
  },
  { toObject: { virtuals: true } }
);
// Accessing a Model
// Once we define a model through mongoose.model('ModelName', mySchema), we can access it through the same function

// const MyModel = mongoose.model('ModelName');
// Or just do it all at once: BlogPost mean the collection's name is blogposts

const BlogPostModel = mongoose.model("BlogPost", BlogPost);
const db = mongoose.model('Recipe', recipeSchema);

const createItem = async () => {
  const firstBlog = new BlogPostModel({
    title: "First blog",
    body: "first body",
    date: new Date(),
  });
  const secondBlog = new BlogPostModel({
    title: "Second blog",
    body: "second body",
    date: new Date(),
  });
  await firstBlog.save();
  await secondBlog.save();
};
// ************ uncomment this only one time

// createItem();

app.get("/", (req, res) => {
  res.send("this is root route");
});

app.get("/api/posts", (req, res) => {
  BlogPostModel.find()
    .then((blog) => res.json(blog))
    .catch((error) => res.send(error));
});
app.get("/api/recipes", (req, res) => {
  db.find()
    .then((blog) => res.json(blog))
    .catch((error) => res.send(error));
});
app.get("/api/tmp", (req, res) => {
  db.find()
    .then((data) => res.render('home', {recipe:data}))
    .catch((error) => res.send(error));
});

app.post("/api/posts", (req, res) => {
  // schema title, body, date
  let title = req.body.title;
  let body = req.body.body;
  const blog = new BlogPostModel({
    title: title,
    body: body,
    date: new Date(),
  });
  BlogPostModel.create(blog)
    .then((newBlog) => res.status(201).json(newBlog))
    .catch((error) => res.send(error));

  // res.send("post route hit, new post created!!")
});
app.post("/api/recipes", (req, res) => {
  // schema title, body, date
  let title = req.body.title;
  let id = req.body.id;
  let instructions = req.body.instructions;
  let ingredients = req.body.ingredients;
  let img = req.body.img;

  const recipe = new db({
    title: title,
    id: id,
    instructions: instructions,
    ingredients: ingredients,
    img: img,
  });
  db.create(recipe)
    .then((newBlog) => res.status(201).json(newBlog))
    .catch((error) => res.send(error));

  // res.send("post route hit, new post created!!")
});
app.get("/api/posts/:id", (req, res) => {
  const search = req.params.id;
  BlogPostModel.findById(search)
    .then((blog) => res.json(blog))
    .catch((error) => res.send(error));
});
app.put("/api/posts/:id", (req, res) => {
  const search = req.params.id;
  const body = req.body;
  BlogPostModel.findOneAndUpdate({ _id: search }, body, { new: true })
    .then((blog) => res.json(blog))
    .catch((error) => res.send(error));
});
app.delete("/api/posts/:id", (req, res) => {
  BlogPostModel.deleteOne({ id: req.params.id })
    .then(() => res.json("we deleted it!!"))
    .catch((error) => res.send(error));
});

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`Server started, listening on port ${PORT}`);
});
