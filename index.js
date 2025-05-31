import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from 'pg';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

//database connectivity
const db = new pg.Client({
    user: "postgres",
    host:"db.kdknljwwppcrehdlfwwr.supabase.co",
    database:"postgres",
    password:"normalNonsense2311",
    port:"5432"
});

db.connect();



//middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Blog Data
var allBlogs = [];   

//add post to allBlogs array
async function addPost(title, author, content){
    await db.query("INSERT INTO blogs(title, author, content) VALUES($1, $2, $3)", [title, author, content]);
}

//delete blog
async function deleteBlog(index){
    await db.query("DELETE FROM blogs WHERE id = $1", [index]);
}

//edit blog 
async function editBlog(index, title, author, content){
    await db.query("UPDATE blogs SET title = $1, author = $2, content = $3 WHERE id = $4", [title, author, content, index]);
}

//home page
app.get("/", async (req, res)=>{
    const result = await db.query("SELECT * FROM blogs");
    allBlogs = result.rows;
    res.render("index.ejs",{ allBlogs: allBlogs });
});

//create page
app.get("/create", (req, res)=>{
    res.render("create.ejs");
});

//publish new blog 
app.post("/publish", (req, res)=>{
    let title = req.body["heading"];
    let author = req.body["author"];
    let content = req.body["blog-content"];
    addPost(title, author, content);
    res.redirect("/");
});

//view blog
app.get("/blog/:id", (req, res)=>{
    let index = req.params.id;

    let currentBlog = allBlogs[index];
    res.render("blog.ejs", 
        {
            postId: currentBlog.id, 
            blogTitle: currentBlog.title, 
            blogAuthor: currentBlog.author, 
            blogContent: currentBlog.content,
            postIdd: index
        } 
    );
});

//delete blog
app.post("/delete", (req, res)=>{
    let index = req.body["postId"];
    deleteBlog(index);
    res.redirect("/");
});

//edit blog page
app.get("/edit/:id", (req, res)=>{
    let index = req.params.id;
    let currentBlog = allBlogs[index];
    res.render("create.ejs",
        {
            postId: currentBlog.id,
            blogTitle: currentBlog.title, 
            blogAuthor: currentBlog.author, 
            blogContent: currentBlog.content
        }
    );
});


//update blog(save changes)
app.post("/update", (req, res)=>{
    let title = req.body["heading"];
    let author = req.body["author"];
    let content = req.body["blog-content"];
    let index = req.body["index"];
    editBlog(index, title, author, content);
    res.redirect("/");

});

// server 
app.listen(port, ()=>{
   console.log(`Server running on port ${port}`); 
});
