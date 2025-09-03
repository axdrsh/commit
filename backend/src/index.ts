import express, { Express, Request, Response } from "express";
import prisma from "./utils/prisma";
import router from "./routes/authRouter";
import profileRouter from "./routes/profileRouter";
import technologyRouter from "./routes/technologyRouter";

const app: Express = express();
const port = 3000;

app.use(express.json());

app.use("/auth", router);
app.use("/profile", profileRouter);
app.use("/api/technologies", technologyRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("express + typescript server");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
