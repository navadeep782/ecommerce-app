


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");           // ✅ needed for socket.io
const { Server } = require("socket.io"); // ✅ socket.io
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

connectDB();

const app = express();

// ✅ Create HTTP server from express app
const server = http.createServer(app);

// ✅ Initialize Socket.IO to  server with CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Make io accessible everywhere via req.app.get("io")
app.set("io", io);
global.io = io; // ✅ make accessible in webhookRoutes
// ✅ Socket.io connection handler
io.on("connection", (socket) => {


  // You can listen for custom events here, e.g.:
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  // ✅ Admin joins admin room
  socket.on("joinAdmin", () => {
    socket.join("adminRoom");
  });

  socket.on("disconnect", () => {
  });
});


// ✅ WEBHOOK — raw body applied to exact path before express.json()
const webHooksRoutes = require("./routes/webhookRoutes");
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));
app.use("/api/webhook", webHooksRoutes);

// ✅ STEP 2 — Body parsers AFTER webhook
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ STEP 3 — All routes AFTER body parsers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));


// ✅ STEP 4 — Rate limiter and error handlers last
const rateLimiter = require("./middleware/rateLimiter");
app.use("/api", rateLimiter);

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

server.listen(process.env.PORT);