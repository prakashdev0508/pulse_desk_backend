"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationSlugcheck = void 0;
const dbconfig_1 = require("../config/db/dbconfig");
const organisationSlugcheck = async (slug) => {
    try {
        const organisation = await dbconfig_1.prisma.organization.findUnique({
            where: { slug },
        });
        if (organisation) {
            return false; // Slug exists
        }
        return true;
    }
    catch (error) {
        throw new Error("Error checking organisation slug: " + error);
    }
};
exports.organisationSlugcheck = organisationSlugcheck;
