const express = require("express");
const mongoose = require("mongoose");
const userSchema = require("./schema/userSchema");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
require("dotenv").config();
const { cleanupAndValidate } = require("./utils/authUtil");

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const store = new mongoDbSession({
  uri: MONGO_URL,
  collection: "sessions",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Try testing",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//DB connect
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/signup", async (req, res) => {
  return res.send(
    `<html>
    <body>
      <h1>Signup</h1>
      <form action="/signup" method="POST">
        <label for="name">Name:</label>
        <input type="text" name="name" />
        <label for="email">Email:</label>
        <input type="text" name="email" />
        <label for="username">Username:</label>
        <input type="text" name="username" />
        <label for="password">Password:</label>
        <input type="text" name="password" />
      <button type="submit">Submit</button>

      </form>
    </body>
  </html>
  `
  );
});

app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  // console.log(userObj);
  try {
    await cleanupAndValidate({ name, email, username, password });
    console.log("data cleaned");
  } catch (error) {
    return res.send({
      status: 404,
      message: "Data error",
      error: error,
    });
  }
  const userEmailExist = await userSchema.findOne({ email });
  if (userEmailExist) {
    return res.send({
      status: 404,
      message: "Email already exists",
    });
  }

  const userUsernameExist = await userSchema.findOne({ username });
  if (userUsernameExist) {
    return res.send({
      status: 404,
      message: "Username already exists",
    });
  }

  const userObj = new userSchema({ name, email, username, password });
  try {
    const userDb = await userObj.save();
    return res.redirect("/login");
  } catch (error) {
    return res.send({
      status: 500,
      message: "Data base error",
      error: error,
    });
  }
});

app.get("/login", async (req, res) => {
  return res.send(
    `
    <html>
  <body>
    <h1>Login</h1>
    <form action="/login" method="POST">
      <label for="email">Email:</label>
      <input type="text" name="email" />
      <label for="password">Password:</label>
      <input type="text" name="password" />
      <button type="submit">Submit</button>
    </form>
  </body>
</html>
    `
  );
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  try {
    const userDb = await userSchema.findOne({ email });
    if (!userDb) {
      return res.send("user not found");
    }
    req.session.isAuth = true;
    return res.send("user found");
  } catch (err) {
    return res.send("database error");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.isAuth) {
    return res.send("dashboard page");
  } else {
    return res.send("Session expired please login again login page");
  }
});

app.listen(PORT, () => {
  console.log(`server is up and running on PORT:${PORT}`);
});
