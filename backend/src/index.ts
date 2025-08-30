import express, { Express, Request, Response } from "express";
import { PrismaClient } from "./generated/prisma";

const app: Express = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json()); // Middleware to parse JSON bodies

// Route to create a new user
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "error creating user" });
  }
});

// Route to get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "error fetching users" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("express + typescript server");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
