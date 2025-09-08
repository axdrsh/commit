import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import router from "./routes/authRouter";
import profileRouter from "./routes/profileRouter";
import technologyRouter from "./routes/technologyRouter";
import swipeRouter from "./routes/swipeRouter";
import chatRouter from "./routes/chatRouter";
import { initializeSocket } from "./socket/socketServer";

const app: Express = express();
const server = createServer(app);
const port = 3000;

const io = initializeSocket(server);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/auth", router);
app.use("/profile", profileRouter);
app.use("/api/technologies", technologyRouter);
app.use("/api", swipeRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("express + typescript server with chat");
});

server.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
  console.log(`socket.io server is ready for chat connections`);
});
