import express, { Express, Request, Response } from "express";
import prisma from "./utils/prisma";
import router from "./routes/authRouter";

const app: Express = express();
const port = 3000;

app.use(express.json());

app.use("/auth", router);

app.get("/", (req: Request, res: Response) => {
  res.send("express + typescript server");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
