import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware"; // adjust path
import prisma from "../utils/prisma"; // adjust path

// update the authenticated user's profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { name, bio, age, gender, profilePictureUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        age,
        gender,
        profilePictureUrl,
      },
      select: {
        // ensures we don't return the password
        id: true,
        email: true,
        name: true,
        bio: true,
        age: true,
        gender: true,
        profilePictureUrl: true,
        createdAt: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

// get a user's public profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        age: true,
        gender: true,
        profilePictureUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
