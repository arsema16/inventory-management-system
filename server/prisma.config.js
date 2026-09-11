import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
const config = {
    orm: ormConfig({
        contract: "./prisma/contract.prisma",
        db: {
            connection: process.env["DATABASE_URL"],
        },
    }),
    skills: {
        agents: ["claude", "cursor", "agents", "devin"],
    },
};
export default definePrismaConfig(config);
//# sourceMappingURL=prisma.config.js.map