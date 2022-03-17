const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const cors = require("cors");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DBconnection Successful"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Backend Server is running");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
  },
});

let onlineAdminUsers = [];

const addNewUser = (username, socketId) => {
  !onlineAdminUsers.some((user) => user.username === username) &&
    onlineAdminUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineAdminUsers = onlineAdminUsers.filter(
    (user) => user.socketId !== socketId
  );
};

const getUser = (username) => {
  return onlineAdminUsers.find((user) => user.username === username);
};

const getVisitorCount = (count) => {
  var c = count - onlineAdminUsers.length;
  if (c <= 0) {
    return 0;
  } else {
    return c;
  }
};

io.on("connection", (socket) => {

  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
    const usernameList = [];
    onlineAdminUsers.forEach((e) => usernameList.push(e.username));
    onlineAdminUsers.forEach((e) => {
      io.to(e.socketId).emit("online", usernameList);
    });
  });

  onlineAdminUsers.forEach((e) => {
    io.to(e.socketId).emit(
      "shopVisitors",
      getVisitorCount(socket.client.conn.server.clientsCount)
    );
  });

  socket.on("sendNotification", ({ data, recieverName }) => {
    const reciever = getUser(recieverName);
    io.to(reciever?.socketId).emit("getNotification", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    setTimeout(() => {
      onlineAdminUsers.forEach((e) => {
        io.to(e.socketId).emit("disconnected", {
          count: getVisitorCount(socket.client.conn.server.clientsCount),
        });
      });
    }, 1000);
  });
});
