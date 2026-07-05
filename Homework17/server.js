const express = require("express");
const app = express();
const connectToDb = require("./config/db.config");
const authRouter = require("./auth/auth.controller");
const blogRouter = require("./blogs/blog.controller");
const userRouter = require("./users/user.controller");

app.use(express.json());

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/blogs", blogRouter);

connectToDb().then(() => {
  app.listen(4000, () => {
    console.log("server running on http://localhost:4000");
  });
});
