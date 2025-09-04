import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prisma";

// handle user like - create like and check for mutual match
export const likeUser = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.userId;
  const { likedUserId } = req.body;

  if (!currentUserId) {
    return res.status(401).json({
      success: false,
      error: "User not authenticated",
    });
  }

  if (!likedUserId) {
    return res.status(400).json({
      success: false,
      error: "likedUserId is required",
    });
  }

  if (currentUserId === likedUserId) {
    return res.status(400).json({
      success: false,
      error: "You cannot like yourself",
    });
  }

  try {
    // Check if user has already liked this person
    const existingLike = await prisma.like.findFirst({
      where: {
        likerId: currentUserId,
        likedId: likedUserId,
      },
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: "You have already liked this user",
      });
    }

    // Check if the liked user exists
    const likedUser = await prisma.user.findUnique({
      where: { id: likedUserId },
    });

    if (!likedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Create the like
    const like = await prisma.like.create({
      data: {
        likerId: currentUserId,
        likedId: likedUserId,
      },
    });

    // Check if there's a mutual like (reverse like exists)
    const reverseLike = await prisma.like.findFirst({
      where: {
        likerId: likedUserId,
        likedId: currentUserId,
      },
    });

    let match = null;
    let isMatch = false;

    if (reverseLike) {
      // It's a match! Create a match record
      // Ensure consistent ordering: smaller ID as userA, larger as userB
      const userAId = currentUserId < likedUserId ? currentUserId : likedUserId;
      const userBId = currentUserId < likedUserId ? likedUserId : currentUserId;

      match = await prisma.match.create({
        data: {
          userAId,
          userBId,
        },
        include: {
          userA: {
            select: {
              id: true,
              name: true,
              bio: true,
              age: true,
              technologies: true,
            },
          },
          userB: {
            select: {
              id: true,
              name: true,
              bio: true,
              age: true,
              technologies: true,
            },
          },
        },
      });

      isMatch = true;
    }

    res.json({
      success: true,
      message: isMatch ? "It's a match!" : "Like sent successfully",
      isMatch,
      like: {
        id: like.id,
        likerId: like.likerId,
        likedId: like.likedId,
        createdAt: like.createdAt,
      },
      match: match || null,
    });
  } catch (error) {
    console.error("Error handling like:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process like",
    });
  }
};

// get all matches for the current user
export const getMatches = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.userId;

  if (!currentUserId) {
    return res.status(401).json({
      success: false,
      error: "User not authenticated",
    });
  }

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
      },
      include: {
        userA: {
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
        },
        userB: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to show the "other" user for each match
    const formattedMatches = matches.map((match) => {
      const otherUser =
        match.userAId === currentUserId ? match.userB : match.userA;
      return {
        id: match.id,
        matchedAt: match.createdAt,
        user: otherUser,
      };
    });

    res.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch matches",
    });
  }
};
