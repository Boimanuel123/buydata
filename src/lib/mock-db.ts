// Mock database for development when Prisma connection fails
// File-based storage for persistence across server restarts
import fs from "fs";
import path from "path";

const mockDbPath = path.join(process.cwd(), ".mock-db.json");

interface MockAgent {
  id: string;
  email: string;
  [key: string]: any;
}

interface MockDb {
  agents: { [key: string]: MockAgent };
  nextId: number;
}

// Load mock database from file
function loadMockDb(): MockDb {
  try {
    if (fs.existsSync(mockDbPath)) {
      const data = fs.readFileSync(mockDbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[MOCK-DB] Error loading database:", error);
  }
  return { agents: {}, nextId: 1 };
}

// Save mock database to file
function saveMockDb(db: MockDb) {
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("[MOCK-DB] Error saving database:", error);
  }
}

let mockDb = loadMockDb();

export const mockPrisma = {
  agent: {
    create: async (data: any) => {
      const { email, ...rest } = data.data;
      const id = `mock-${mockDb.nextId++}`;
      const agent = { id, email, ...rest };
      mockDb.agents[email] = agent;
      mockDb.agents[id] = agent;
      saveMockDb(mockDb);
      console.log(`[MOCK-DB] Created agent: ${id} (${email})`);
      return agent;
    },
    findUnique: async (options: any) => {
      const where = options.where;
      let result = null;
      
      if (where.email) {
        result = mockDb.agents[where.email] || null;
        console.log(`[MOCK-DB] findUnique(email=${where.email}):`, result ? "found" : "not found");
      } else if (where.id) {
        result = mockDb.agents[where.id] || null;
        console.log(`[MOCK-DB] findUnique(id=${where.id}):`, result ? "found" : "not found");
      }
      
      return result;
    },
    update: async (options: any) => {
      const where = options.where;
      let agent = null;
      
      if (where.email) {
        agent = mockDb.agents[where.email];
      } else if (where.id) {
        agent = mockDb.agents[where.id];
      }
      
      if (agent) {
        Object.assign(agent, options.data);
        // Update both indexes
        mockDb.agents[agent.email] = agent;
        mockDb.agents[agent.id] = agent;
        saveMockDb(mockDb);
        console.log(`[MOCK-DB] Updated agent`);
      }
      return agent || null;
    },
  },
};

export function isMockingDatabase(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true";
}
