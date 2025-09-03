import prisma from "../src/utils/prisma";
import { TechType } from "../src/generated/prisma";

const technologies = [
  // Languages
  { name: "JavaScript", type: TechType.LANGUAGE },
  { name: "TypeScript", type: TechType.LANGUAGE },
  { name: "Python", type: TechType.LANGUAGE },
  { name: "Java", type: TechType.LANGUAGE },
  { name: "C#", type: TechType.LANGUAGE },
  { name: "Go", type: TechType.LANGUAGE },
  { name: "Rust", type: TechType.LANGUAGE },
  { name: "PHP", type: TechType.LANGUAGE },
  { name: "Ruby", type: TechType.LANGUAGE },
  { name: "Swift", type: TechType.LANGUAGE },
  { name: "Kotlin", type: TechType.LANGUAGE },

  // Frameworks
  { name: "React", type: TechType.FRAMEWORK },
  { name: "Angular", type: TechType.FRAMEWORK },
  { name: "Vue.js", type: TechType.FRAMEWORK },
  { name: "Node.js", type: TechType.FRAMEWORK },
  { name: "Express", type: TechType.FRAMEWORK },
  { name: "Django", type: TechType.FRAMEWORK },
  { name: "Ruby on Rails", type: TechType.FRAMEWORK },
  { name: "Spring", type: TechType.FRAMEWORK },
  { name: ".NET", type: TechType.FRAMEWORK },
  { name: "Laravel", type: TechType.FRAMEWORK },

  // Databases
  { name: "PostgreSQL", type: TechType.DATABASE },
  { name: "MySQL", type: TechType.DATABASE },
  { name: "MongoDB", type: TechType.DATABASE },
  { name: "Redis", type: TechType.DATABASE },
  { name: "SQLite", type: TechType.DATABASE },
  { name: "Microsoft SQL Server", type: TechType.DATABASE },

  // Tools
  { name: "Docker", type: TechType.TOOL },
  { name: "Git", type: TechType.TOOL },
  { name: "Kubernetes", type: TechType.TOOL },
  { name: "Jenkins", type: TechType.TOOL },
  { name: "Terraform", type: TechType.TOOL },

  // Libraries
  { name: "jQuery", type: TechType.LIBRARY },
  { name: "React Native", type: TechType.LIBRARY },
  { name: "Flutter", type: TechType.LIBRARY },
  { name: "Pandas", type: TechType.LIBRARY },
  { name: "NumPy", type: TechType.LIBRARY },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const tech of technologies) {
    const technology = await prisma.technology.upsert({
      where: { name: tech.name },
      update: {},
      create: {
        name: tech.name,
        type: tech.type,
      },
    });
    console.log(`Created technology with id: ${technology.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
