import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import userRouter from "./routes/user.js"
import authMiddleware from "./middleware/auth.js"
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import pollRouter from "./routes/poll.js";
import Poll from "./models/poll.js";


dotenv.config(); //loads jwtsecret and mongouri 
const app = express();
const PORT = 8080;
const httpServer = createServer(app);
const io = new Server(httpServer)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static("public")); 

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB coneected"))
.catch((err) => console.error("MongoDB error:", err))

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "createBtn.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "login.html"))
})

app.get("/signup", (req, res) => {
    console.log("CWD:", process.cwd());
    console.log("__dirname:", __dirname);
    res.sendFile(path.join(process.cwd(), "public", "signup.html"))
})

app.get("/create-poll", authMiddleware, (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "createPoll.html"))
})

app.get("/poll/:id/responses", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "responsePage.html"))
})

app.get("/poll/:id", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "displayPoll.html"))
})

app.get("/logout", (req,res) => {
    res.clearCookie("token");
    res.redirect("/login");
})

app.use("/", userRouter);
app.use("/poll", pollRouter);

io.on('connection', (socket) => {

    //user ne join kiya poll room
    socket.on("join-poll", (pollId) => {
 socket.join(pollId);
  });

  //user ne vote kiya 
  socket.on("vote", async ({pollId, questionIndex, optionIndex}) => {
    const poll = await Poll.findById(pollId)
    if(!poll) return

    //increment in the vote count for a particular option
    poll.questions[questionIndex].votes[optionIndex] += 1 
    await poll.save()

    //broadcast updated votes to everyone using that poll 
    io.to(pollId).emit("vote-updated",{
        questionIndex, 
        votes: poll.questions[questionIndex].votes
    })
  })
})


httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`) )

export {io}; 