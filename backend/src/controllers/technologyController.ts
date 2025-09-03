import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { TechType } from "../generated/prisma";

export const getAllTechnologies = async (req: Request, res: Response) => {
  try {
    const technologies = await prisma.technology.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Group technologies by type for easier frontend consumption
    const groupedTechnologies = technologies.reduce((acc, tech) => {
      if (!acc[tech.type]) {
        acc[tech.type] = [];
      }
      acc[tech.type].push(tech);
      return acc;
    }, {} as Record<TechType, typeof technologies>);

    res.json({
      success: true,
      data: {
        all: technologies,
        grouped: groupedTechnologies,
      },
    });
  } catch (error) {
    console.error("Error fetching technologies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch technologies",
    });
  }
};
