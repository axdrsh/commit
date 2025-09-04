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
      },
      select: {
        // ensures we don't return the password
        id: true,
        email: true,
        name: true,
        bio: true,
        age: true,
        gender: true,
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
        yearsOfExperience: true,
        role: true,
        githubUrl: true,
        technologies: true,
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

// add a technology to the authenticated user's profile
export const addTechnologyToProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  const { technologyId } = req.body;

  if (!technologyId) {
    return res.status(400).json({
      success: false,
      error: "Technology ID is required",
    });
  }

  try {
    // Check if technology exists
    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
    });

    if (!technology) {
      return res.status(404).json({
        success: false,
        error: "Technology not found",
      });
    }

    // Check if user already has this technology
    const existingConnection = await prisma.user.findFirst({
      where: {
        id: userId,
        technologies: {
          some: { id: technologyId },
        },
      },
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: "Technology already added to profile",
      });
    }

    // Add technology to user's profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        technologies: {
          connect: { id: technologyId },
        },
      },
      select: {
        id: true,
        technologies: true,
      },
    });

    res.json({
      success: true,
      message: "Technology added to profile",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error adding technology to profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add technology to profile",
    });
  }
};

// remove a technology from the authenticated user's profile
export const removeTechnologyFromProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  const { techId } = req.params;

  try {
    // Check if user has this technology
    const userWithTech = await prisma.user.findFirst({
      where: {
        id: userId,
        technologies: {
          some: { id: techId },
        },
      },
    });

    if (!userWithTech) {
      return res.status(404).json({
        success: false,
        error: "Technology not found in user's profile",
      });
    }

    // Remove technology from user's profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        technologies: {
          disconnect: { id: techId },
        },
      },
      select: {
        id: true,
        technologies: true,
      },
    });

    res.json({
      success: true,
      message: "Technology removed from profile",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error removing technology from profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove technology from profile",
    });
  }
};

// get users for discovery/swiping
export const getUsersForDiscovery = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.userId;

  try {
    // First, get all user IDs that the current user has already liked
    const alreadyLiked = await prisma.like.findMany({
      where: { likerId: currentUserId },
      select: { likedId: true },
    });

    const alreadyLikedUserIds = alreadyLiked.map((like) => like.likedId);

    // Get users excluding current user and already liked users
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
          notIn: alreadyLikedUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        bio: true,
        age: true,
        gender: true,
        yearsOfExperience: true,
        role: true,
        githubUrl: true,
        technologies: true,
      },
      take: 20, // Limit to 20 users at a time
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users for discovery:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users for discovery",
    });
  }
};
