import { prisma } from "../config/db/dbconfig";

export const organisationSlugcheck = async (slug: string) => {
  try {
    const organisation = await prisma.organization.findUnique({
      where: { slug },
    });

    if (organisation) {
      return false; // Slug exists
    }
    return true;
  } catch (error) {
    throw new Error("Error checking organisation slug: " + error);
  }
};
