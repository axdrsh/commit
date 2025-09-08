import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware"; // adjust path
import prisma from "../utils/prisma"; // adjust path
import fs from "fs";
import path from "path";

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
        id: true,
        email: true,
        name: true,
        bio: true,
        age: true,
        gender: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

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
        profilePicture: true,
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
    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
    });

    if (!technology) {
      return res.status(404).json({
        success: false,
        error: "Technology not found",
      });
    }

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

export const removeTechnologyFromProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  const { techId } = req.params;

  try {
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

export const getUsersForDiscovery = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.userId;

  try {
    const alreadyLiked = await prisma.like.findMany({
      where: { likerId: currentUserId },
      select: { likedId: true },
    });

    const alreadyLikedUserIds = alreadyLiked.map((like) => like.likedId);

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
        profilePicture: true,
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

// Upload profile picture
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Get current user to check if they have an existing profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    // Delete old profile picture if it exists
    if (currentUser?.profilePicture) {
      const oldFilePath = path.join(
        process.cwd(),
        "uploads/profile-pictures",
        path.basename(currentUser.profilePicture)
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Create URL for the uploaded file
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        name: true,
        profilePicture: true,
      },
    });

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    // Clean up uploaded file if database update failed
    if (req.file) {
      const filePath = path.join(
        process.cwd(),
        "uploads/profile-pictures",
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      error: "Failed to upload profile picture",
    });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    // Get current user to check if they have a profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    if (!currentUser?.profilePicture) {
      return res.status(404).json({
        success: false,
        error: "No profile picture found",
      });
    }

    // Delete the file from filesystem
    const filePath = path.join(
      process.cwd(),
      "uploads/profile-pictures",
      path.basename(currentUser.profilePicture)
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove profile picture URL from database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: null },
      select: {
        id: true,
        name: true,
        profilePicture: true,
      },
    });

    res.json({
      success: true,
      message: "Profile picture deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete profile picture",
    });
  }
};
