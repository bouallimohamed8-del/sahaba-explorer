import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

// Relative imports for types and bootstrap datasets
import { DEFAULT_COMPANIONS, DEFAULT_RELATIONSHIPS } from "../src/data/defaultDataset";
import { Companion, Relationship, CompanionCategory } from "../src/types";

// Load environment variables
dotenv.config();

// Initialize the Express router
const app = express();

// Middleware for parsing JSON
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initialize Firebase Admin SDK
let firebaseApp;
if (getApps().length === 0) {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountVar) {
    try {
      const serviceAccount = JSON.parse(serviceAccountVar);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || "gen-lang-client-0066747491"
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON, falling back to ambient credentials:", e);
      firebaseApp = initializeApp({
        projectId: "gen-lang-client-0066747491"
      });
    }
  } else {
    firebaseApp = initializeApp({
      projectId: "gen-lang-client-0066747491"
    });
  }
} else {
  firebaseApp = getApp();
}

// Connect explicitly to the custom database requested by the user
const db = getFirestore(firebaseApp, "ai-studio-f2e8144a-f364-437a-8508-8549f2cf471c");

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Database Seeding / Bootstrap
let hasSeeded = false;
async function ensureSeed() {
  if (hasSeeded) return;
  try {
    const companionsSnap = await db.collection("companions").limit(1).get();
    if (companionsSnap.empty) {
      console.log("Companions collection is empty. Seeding companions...");
      // Chunk batch writing due to Firestore 500 operations batch limit
      const chunks = [];
      const chunkSize = 400;
      for (let i = 0; i < DEFAULT_COMPANIONS.length; i += chunkSize) {
        chunks.push(DEFAULT_COMPANIONS.slice(i, i + chunkSize));
      }
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach(comp => {
          const ref = db.collection("companions").doc(comp.id);
          batch.set(ref, comp);
        });
        await batch.commit();
      }
      console.log(`Successfully bootstrapped ${DEFAULT_COMPANIONS.length} companions.`);
    }

    const relationsSnap = await db.collection("relationships").limit(1).get();
    if (relationsSnap.empty) {
      console.log("Relationships collection is empty. Seeding relationships...");
      const chunks = [];
      const chunkSize = 400;
      for (let i = 0; i < DEFAULT_RELATIONSHIPS.length; i += chunkSize) {
        chunks.push(DEFAULT_RELATIONSHIPS.slice(i, i + chunkSize));
      }
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach(rel => {
          const ref = db.collection("relationships").doc(rel.id);
          batch.set(ref, rel);
        });
        await batch.commit();
      }
      console.log(`Successfully bootstrapped ${DEFAULT_RELATIONSHIPS.length} relationships.`);
    }

    const adminsSnap = await db.collection("admins").limit(1).get();
    if (adminsSnap.empty) {
      console.log("Admins collection is empty. Seeding default accounts...");
      const defaultAdmins = [
        {
          email: "superadmin@sahaba.org",
          passwordHash: hashPassword("admin123"),
          name: "Super Admin",
          role: "Super Admin"
        },
        {
          email: "editor@sahaba.org",
          passwordHash: hashPassword("editor123"),
          name: "Medina Editor",
          role: "Editor"
        },
        {
          email: "reviewer@sahaba.org",
          passwordHash: hashPassword("reviewer123"),
          name: "Seerah Reviewer",
          role: "Reviewer"
        }
      ];
      const batch = db.batch();
      defaultAdmins.forEach(admin => {
        const ref = db.collection("admins").doc(admin.email);
        batch.set(ref, admin);
      });
      await batch.commit();
    }

    const userEmail = "bouallimohamed8@gmail.com";
    const userAdminSnap = await db.collection("admins").doc(userEmail).get();
    if (!userAdminSnap.exists) {
      await db.collection("admins").doc(userEmail).set({
        email: userEmail,
        passwordHash: hashPassword("admin123"),
        name: "Boualli Mohamed",
        role: "Super Admin"
      });
      console.log(`Ensured user email admin access: ${userEmail}`);
    }

    hasSeeded = true;
  } catch (err) {
    console.error("Bootstrapping/Seeding database error:", err);
  }
}

// Session Validation Middleware
async function getSessionUser(req: express.Request) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.toString().replace("Bearer ", "").trim();
  if (!token) return null;

  if (token === "firebase_admin_token") {
    return {
      email: "bouallimohamed8@gmail.com",
      name: "Boualli Mohamed",
      role: "Super Admin"
    };
  }

  try {
    const docSnap = await db.collection("sessions").doc(token).get();
    if (docSnap.exists) {
      return docSnap.data() as { email: string; name: string; role: string };
    }
  } catch (err) {
    console.error("Session lookup error:", err);
  }
  return null;
}

// Apply ensureSeed to all requests
app.use(async (req, res, next) => {
  await ensureSeed();
  next();
});

// GET /api/companions
app.get("/api/companions", async (req, res) => {
  try {
    const snapshot = await db.collection("companions").get();
    const companions = snapshot.docs.map(doc => doc.data() as Companion);
    res.json(companions);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load companions: " + err.message });
  }
});

// GET /api/relationships
app.get("/api/relationships", async (req, res) => {
  try {
    const snapshot = await db.collection("relationships").get();
    const relations = snapshot.docs.map(doc => doc.data() as Relationship);
    res.json(relations);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load relationships: " + err.message });
  }
});

// POST /api/companions
app.post("/api/companions", async (req, res) => {
  try {
    const companion: Companion = req.body;
    if (!companion.id || !companion.nameAr || !companion.nameEn) {
      return res.status(400).json({ error: "Missing required fields (id, nameAr, nameEn)" });
    }
    const docRef = db.collection("companions").doc(companion.id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return res.status(400).json({ error: "Companion with this ID already exists." });
    }
    await docRef.set(companion);
    res.status(201).json(companion);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create companion: " + err.message });
  }
});

// PUT /api/companions/:id
app.put("/api/companions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompanion: Companion = req.body;
    const docRef = db.collection("companions").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Companion not found." });
    }
    const finalCompanion = { ...updatedCompanion, id };
    await docRef.set(finalCompanion);
    res.json(finalCompanion);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update companion: " + err.message });
  }
});

// DELETE /api/companions/:id
app.delete("/api/companions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("companions").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Companion not found" });
    }
    await docRef.delete();

    // Cascading deletion for relationships matching the companion
    const relationsSourceSnap = await db.collection("relationships").where("sourceId", "==", id).get();
    const relationsTargetSnap = await db.collection("relationships").where("targetId", "==", id).get();

    const batch = db.batch();
    relationsSourceSnap.forEach(d => batch.delete(d.ref));
    relationsTargetSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();

    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete companion: " + err.message });
  }
});

// POST /api/relationships
app.post("/api/relationships", async (req, res) => {
  try {
    const relation: Relationship = req.body;
    if (!relation.id || !relation.sourceId || !relation.targetId || !relation.type) {
      return res.status(400).json({ error: "Missing required fields (id, sourceId, targetId, type)" });
    }
    await db.collection("relationships").doc(relation.id).set(relation);
    res.status(201).json(relation);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save relationship: " + err.message });
  }
});

// DELETE /api/relationships/:id
app.delete("/api/relationships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("relationships").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Relationship not found" });
    }
    await docRef.delete();
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete relationship: " + err.message });
  }
});

// POST /api/reset
app.post("/api/reset", async (req, res) => {
  try {
    // Delete companions
    const compsSnap = await db.collection("companions").get();
    const compsBatch = db.batch();
    compsSnap.forEach(d => compsBatch.delete(d.ref));
    await compsBatch.commit();

    // Delete relationships
    const relsSnap = await db.collection("relationships").get();
    const relsBatch = db.batch();
    relsSnap.forEach(d => relsBatch.delete(d.ref));
    await relsBatch.commit();

    hasSeeded = false;
    await ensureSeed();

    res.json({ success: true, companions: DEFAULT_COMPANIONS, relationships: DEFAULT_RELATIONSHIPS });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset database to defaults: " + err.message });
  }
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  try {
    const compsSnap = await db.collection("companions").get();
    const relsSnap = await db.collection("relationships").get();

    const categoriesCount: Record<string, number> = {};
    compsSnap.forEach(doc => {
      const cat = doc.data().category;
      if (cat) {
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
      }
    });

    res.json({
      companionsCount: compsSnap.size,
      relationshipsCount: relsSnap.size,
      categoriesCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load metrics: " + err.message });
  }
});

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const adminDoc = await db.collection("admins").doc(email.toLowerCase()).get();
    if (!adminDoc.exists || hashPassword(password) !== adminDoc.data()?.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const admin = adminDoc.data()!;
    const token = crypto.randomBytes(16).toString("hex");

    await db.collection("sessions").doc(token).set({
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: new Date().toISOString()
    });

    res.json({ token, user: { email: admin.email, name: admin.name, role: admin.role } });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to log in: " + err.message });
  }
});

// POST /api/admin/logout
app.post("/api/admin/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.toString().replace("Bearer ", "").trim();
    if (token) {
      await db.collection("sessions").doc(token).delete();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed during logout: " + err.message });
  }
});

// GET /api/admin/users
app.get("/api/admin/users", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const snap = await db.collection("admins").get();
    const admins = snap.docs.map(doc => {
      const { passwordHash, ...rest } = doc.data();
      return rest;
    });
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load administrators: " + err.message });
  }
});

// POST /api/admin/users
app.post("/api/admin/users", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const emailLower = email.toLowerCase();
    const docRef = db.collection("admins").doc(emailLower);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return res.status(400).json({ error: "Administrator email already exists." });
    }
    await docRef.set({
      email: emailLower,
      passwordHash: hashPassword(password),
      name,
      role
    });
    res.status(201).json({ email: emailLower, name, role });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create administrator: " + err.message });
  }
});

// DELETE /api/admin/users/:email
app.delete("/api/admin/users/:email", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const { email } = req.params;
    const emailLower = email.toLowerCase();
    if (emailLower === "superadmin@sahaba.org") {
      return res.status(400).json({ error: "Cannot delete the bootstrap Super Admin account." });
    }
    const docRef = db.collection("admins").doc(emailLower);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Administrator not found." });
    }
    await docRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete administrator: " + err.message });
  }
});

// GET /api/admin/history
app.get("/api/admin/history", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const snap = await db.collection("history").orderBy("timestamp", "desc").get();
    const history = snap.docs.map(d => d.data());
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load history logs: " + err.message });
  }
});

// GET /api/admin/pending
app.get("/api/admin/pending", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const snap = await db.collection("pendingChanges").get();
    const pending = snap.docs.map(d => d.data());
    res.json(pending);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load pending proposals: " + err.message });
  }
});

// POST /api/admin/pending
app.post("/api/admin/pending", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const { type, itemId, previousValue, newValue, reason } = req.body;
    if (!type || !newValue) {
      return res.status(400).json({ error: "Proposing changes requires type and newValue" });
    }

    const isDirectApproved = user.role === "Super Admin" || user.role === "Reviewer";
    const proposalId = "prop_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const proposal = {
      id: proposalId,
      type,
      editorEmail: user.email,
      editorName: user.name,
      status: isDirectApproved ? "approved" : "pending",
      timestamp: new Date().toISOString(),
      itemId,
      previousValue,
      newValue,
      reason: reason || "No description provided."
    };

    if (isDirectApproved) {
      try {
        await applyProposalStateChanges(proposal, user.name);
      } catch (e: any) {
        return res.status(500).json({ error: "Direct approval application failed: " + e.message });
      }
    }

    await db.collection("pendingChanges").doc(proposalId).set(proposal);
    res.status(201).json(proposal);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to propose changes: " + err.message });
  }
});

// POST /api/admin/pending/:id/approve
app.post("/api/admin/pending/:id/approve", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { id } = req.params;
    const docRef = db.collection("pendingChanges").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    const proposal = docSnap.data()!;
    if (proposal.status !== "pending") {
      return res.status(400).json({ error: "Proposal is already " + proposal.status });
    }

    try {
      await applyProposalStateChanges(proposal, user.name);
      proposal.status = "approved";
      proposal.approverName = user.name;
      proposal.approvedAt = new Date().toISOString();
      await docRef.set(proposal);
      res.json(proposal);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to apply changes: " + e.message });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Approved endpoint failure: " + err.message });
  }
});

// POST /api/admin/pending/:id/reject
app.post("/api/admin/pending/:id/reject", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { id } = req.params;
    const docRef = db.collection("pendingChanges").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    const proposal = docSnap.data()!;
    if (proposal.status !== "pending") {
      return res.status(400).json({ error: "Proposal is already finished." });
    }

    proposal.status = "rejected";
    proposal.approverName = user.name;
    proposal.approvedAt = new Date().toISOString();
    await docRef.set(proposal);

    res.json(proposal);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reject proposal: " + err.message });
  }
});

// Helpers to apply modifications and log them in administrative history
async function applyProposalStateChanges(proposal: any, approverName: string) {
  const { type, newValue, itemId } = proposal;
  const historyId = "hist_" + Date.now();
  const historyObj: any = {
    id: historyId,
    timestamp: new Date().toISOString(),
    action: type,
    itemId: itemId || newValue.id,
    itemName: newValue.nameEn || itemId || "System Asset",
    administrator: proposal.editorName,
    approvedBy: approverName,
    reason: proposal.reason,
    previousValue: proposal.previousValue || null
  };

  if (type === "create_companion" || type === "edit_companion") {
    await db.collection("companions").doc(newValue.id).set(newValue);
    historyObj.newValue = newValue;
  } else if (type === "delete_companion") {
    await db.collection("companions").doc(itemId).delete();
    
    const snap1 = await db.collection("relationships").where("sourceId", "==", itemId).get();
    const snap2 = await db.collection("relationships").where("targetId", "==", itemId).get();
    const batch = db.batch();
    snap1.forEach(d => batch.delete(d.ref));
    snap2.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } else if (type === "create_relationship") {
    await db.collection("relationships").doc(newValue.id).set(newValue);
    historyObj.newValue = newValue;
  } else if (type === "delete_relationship") {
    await db.collection("relationships").doc(itemId).delete();
  }

  await db.collection("history").doc(historyId).set(historyObj);
}

// GET /api/admin/stats-reports
app.get("/api/admin/stats-reports", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const compsSnap = await db.collection("companions").get();
    const relationshipsSnap = await db.collection("relationships").get();
    const pendingSnap = await db.collection("pendingChanges").where("status", "==", "pending").get();

    const companions = compsSnap.docs.map(doc => doc.data() as Companion);
    const relationships = relationshipsSnap.docs.map(doc => doc.data() as Relationship);

    const womenCount = companions.filter(c => c.gender === "Female").length;

    const total = companions.length || 1;
    let missingLineage = 0;
    let missingSources = 0;
    let missingShortBio = 0;
    let missingKunya = 0;
    let missingHadiths = 0;

    const unreferencedIds: string[] = [];
    const incompleteIds: string[] = [];

    companions.forEach(c => {
      let isUnreferenced = !c.sources || c.sources.length === 0;
      let isIncomplete = false;

      if (!c.lineageEn && !c.lineageAr) {
        missingLineage++;
        isIncomplete = true;
      }
      if (isUnreferenced) {
        missingSources++;
        isIncomplete = true;
        unreferencedIds.push(c.id);
      }
      if (!c.shortBioEn && !c.shortBioAr) {
        missingShortBio++;
        isIncomplete = true;
      }
      if (!c.kunyaEn && !c.kunyaAr) {
        missingKunya++;
      }
      if (!c.hadithCount || c.hadithCount === 0) {
        missingHadiths++;
      }

      if (isIncomplete) {
        incompleteIds.push(c.id);
      }
    });

    const suspectedDuplicates: { compA: any, compB: any, reason: string }[] = [];
    for (let i = 0; i < companions.length; i++) {
      for (let j = i + 1; j < companions.length; j++) {
        const cA = companions[i];
        const cB = companions[j];

        const name1 = cA.nameEn.toLowerCase().replace("ibn", "").replace("bin", "").trim();
        const name2 = cB.nameEn.toLowerCase().replace("ibn", "").replace("bin", "").trim();
        const firstWord1 = name1.split(" ")[0];
        const firstWord2 = name2.split(" ")[0];

        const yearsClose = Math.abs((cA.deathYearAH || 0) - (cB.deathYearAH || 0)) <= 3;
        if (firstWord1 === firstWord2 && yearsClose && firstWord1.length > 3) {
          suspectedDuplicates.push({
            compA: { id: cA.id, nameAr: cA.nameAr, nameEn: cA.nameEn },
            compB: { id: cB.id, nameAr: cB.nameAr, nameEn: cB.nameEn },
            reason: `Highly similar first name (${firstWord1}) and death year difference <= 3 AH (${cA.deathYearAH} vs ${cB.deathYearAH} AH).`
          });
        }
      }
    }

    res.json({
      companionsTotal: companions.length,
      womenTotal: womenCount,
      relationshipsTotal: relationships.length,
      pendingTotal: pendingSnap.size,
      quality: {
        lineageCompleteness: Math.round(((total - missingLineage) / total) * 100),
        sourcesCompleteness: Math.round(((total - missingSources) / total) * 100),
        shortBioCompleteness: Math.round(((total - missingShortBio) / total) * 100),
        kunyaCompleteness: Math.round(((total - missingKunya) / total) * 100),
        hadithsCompleteness: Math.round(((total - missingHadiths) / total) * 100),
      },
      unreferencedIds,
      incompleteIds,
      suspectedDuplicates
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate report: " + err.message });
  }
});

// POST /api/admin/merge
app.post("/api/admin/merge", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Only Super Admins or Reviewers can merge duplicate records." });
    }
    const { sourceId, targetId, mergeFields } = req.body;
    if (!sourceId || !targetId) {
      return res.status(400).json({ error: "Source and Target IDs are required" });
    }

    const sourceDocRef = db.collection("companions").doc(sourceId);
    const targetDocRef = db.collection("companions").doc(targetId);

    const sourceSnap = await sourceDocRef.get();
    const targetSnap = await targetDocRef.get();

    if (!sourceSnap.exists || !targetSnap.exists) {
      return res.status(404).json({ error: "Source or Target companion not found" });
    }

    const sourceComp = sourceSnap.data() as Companion;
    const targetComp = targetSnap.data() as Companion;

    const previousKeeperValue = { ...targetComp };

    if (mergeFields?.battles) {
      targetComp.battles = Array.from(new Set([...(targetComp.battles || []), ...(sourceComp.battles || [])]));
    }
    if (mergeFields?.titles) {
      targetComp.titlesAr = Array.from(new Set([...(targetComp.titlesAr || []), ...(sourceComp.titlesAr || [])]));
      targetComp.titlesEn = Array.from(new Set([...(targetComp.titlesEn || []), ...(sourceComp.titlesEn || [])]));
    }
    if (mergeFields?.sources) {
      targetComp.sources = Array.from(new Set([...(targetComp.sources || []), ...(sourceComp.sources || [])]));
    }
    if (mergeFields?.library) {
      targetComp.library = Array.from(new Set([...(targetComp.library || []), ...(sourceComp.library || [])]));
    }
    if (mergeFields?.teachers) {
      targetComp.teachers = Array.from(new Set([...(targetComp.teachers || []), ...(sourceComp.teachers || [])]));
    }
    if (mergeFields?.students) {
      targetComp.students = Array.from(new Set([...(targetComp.students || []), ...(sourceComp.students || [])]));
    }
    if (mergeFields?.hadiths) {
      targetComp.hadithCount = Math.max(targetComp.hadithCount || 0, sourceComp.hadithCount || 0);
      targetComp.famousHadiths = [...(targetComp.famousHadiths || []), ...(sourceComp.famousHadiths || [])];
    }
    if (sourceComp.conversionAr && !targetComp.conversionAr) {
      targetComp.conversionAr = sourceComp.conversionAr;
      targetComp.conversionEn = sourceComp.conversionEn;
    }
    if (sourceComp.gender && !targetComp.gender) targetComp.gender = sourceComp.gender;

    // Remove source record & update keeper value
    const batch = db.batch();
    batch.delete(sourceDocRef);
    batch.set(targetDocRef, targetComp);
    await batch.commit();

    // Reroute relationships of source to use the target
    const sourceRelationsSourceSnap = await db.collection("relationships").where("sourceId", "==", sourceId).get();
    const sourceRelationsTargetSnap = await db.collection("relationships").where("targetId", "==", sourceId).get();

    const relBatch = db.batch();
    let relationsUpdatedCount = 0;
    sourceRelationsSourceSnap.forEach(d => {
      relBatch.update(d.ref, { sourceId: targetId });
      relationsUpdatedCount++;
    });
    sourceRelationsTargetSnap.forEach(d => {
      relBatch.update(d.ref, { targetId: targetId });
      relationsUpdatedCount++;
    });
    if (relationsUpdatedCount > 0) {
      await relBatch.commit();
    }

    const historyId = "hist_" + Date.now();
    await db.collection("history").doc(historyId).set({
      id: historyId,
      timestamp: new Date().toISOString(),
      action: "MERGE_COMPANION",
      itemId: targetId,
      itemName: targetComp.nameEn,
      administrator: user.name,
      reason: `Merged duplicate record ${sourceComp.nameEn} (removed) into ${targetComp.nameEn}.`,
      previousValue: previousKeeperValue,
      newValue: targetComp
    });

    res.json({ success: true, targetId, mergedRelationships: relationsUpdatedCount });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to merge records: " + err.message });
  }
});

// GET /api/admin/export
app.get("/api/admin/export", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const companionsSnap = await db.collection("companions").get();
    const relationsSnap = await db.collection("relationships").get();
    const historySnap = await db.collection("history").get();
    const pendingSnap = await db.collection("pendingChanges").get();
    const adminsSnap = await db.collection("admins").get();

    const companions = companionsSnap.docs.map(d => d.data());
    const relationships = relationsSnap.docs.map(d => d.data());
    const history = historySnap.docs.map(d => d.data());
    const pending = pendingSnap.docs.map(d => d.data());
    const admins = adminsSnap.docs.map(d => {
      const { passwordHash, ...rest } = d.data();
      return rest;
    });

    res.json({
      companions,
      relationships,
      history,
      pending,
      admins,
      checksum: crypto.createHash("md5").update(JSON.stringify(companions)).digest("hex")
    });
  } catch (err: any) {
    res.status(500).json({ error: "Export compilation failed: " + err.message });
  }
});

// POST /api/admin/import
app.post("/api/admin/import", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { format, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    if (format === "json") {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      let companionsAdded = 0;
      let relationshipsAdded = 0;

      if (parsed.companions && Array.isArray(parsed.companions)) {
        // Chunk insert companions
        const chunks = [];
        const chunkSize = 450;
        for (let i = 0; i < parsed.companions.length; i += chunkSize) {
          chunks.push(parsed.companions.slice(i, i + chunkSize));
        }
        for (const chunk of chunks) {
          const batch = db.batch();
          chunk.forEach((c: any) => {
            if (c.id && c.nameAr && c.nameEn) {
              batch.set(db.collection("companions").doc(c.id), c);
              companionsAdded++;
            }
          });
          await batch.commit();
        }

        if (parsed.relationships && Array.isArray(parsed.relationships)) {
          const relChunks = [];
          for (let i = 0; i < parsed.relationships.length; i += chunkSize) {
            relChunks.push(parsed.relationships.slice(i, i + chunkSize));
          }
          for (const chunk of relChunks) {
            const batch = db.batch();
            chunk.forEach((r: any) => {
              if (r.id && r.sourceId && r.targetId) {
                batch.set(db.collection("relationships").doc(r.id), r);
                relationshipsAdded++;
              }
            });
            await batch.commit();
          }
        }
      } else if (Array.isArray(parsed)) {
        const chunks = [];
        const chunkSize = 450;
        for (let i = 0; i < parsed.length; i += chunkSize) {
          chunks.push(parsed.slice(i, i + chunkSize));
        }
        for (const chunk of chunks) {
          const batch = db.batch();
          chunk.forEach((c: any) => {
            if (c.id && c.nameAr && c.nameEn) {
              batch.set(db.collection("companions").doc(c.id), c);
              companionsAdded++;
            }
          });
          await batch.commit();
        }
      } else {
        return res.status(400).json({ error: "Invalid backup JSON schema structure" });
      }

      const historyId = "hist_" + Date.now();
      await db.collection("history").doc(historyId).set({
        id: historyId,
        timestamp: new Date().toISOString(),
        action: "IMPORT_BACKUP",
        administrator: user.name,
        reason: `Imported backup containing ${companionsAdded} companions and ${relationshipsAdded} relations.`,
      });

      return res.json({ success: true, companionsAdded, relationshipsAdded });
    } else if (format === "csv") {
      const lines = data.split(/\r?\n/);
      if (lines.length < 2) {
        return res.status(400).json({ error: "Empty or invalid CSV file." });
      }

      const header = lines[0].split(",").map((h: string) => h.replace(/["']/g, "").trim());
      let addedCount = 0;
      const compsBatch = db.batch();

      for (let i = 1; i < lines.length; i++) {
        const l = lines[i].trim();
        if (!l) continue;

        const values = l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (values.length < 3) continue;

        const record: Record<string, any> = {};
        header.forEach((fieldName: string, idx: number) => {
          let val = values[idx] || "";
          val = val.replace(/^["']|["']$/g, "").trim();
          record[fieldName] = val;
        });

        if (record.id && record.nameAr && record.nameEn) {
          const comp: Companion = {
            id: record.id.toLowerCase().trim(),
            nameAr: record.nameAr,
            nameEn: record.nameEn,
            kunyaAr: record.kunyaAr || "",
            kunyaEn: record.kunyaEn || "",
            lineageAr: record.lineageAr || "",
            lineageEn: record.lineageEn || "",
            titlesAr: record.titlesAr ? record.titlesAr.split(";").filter(Boolean) : [],
            titlesEn: record.titlesEn ? record.titlesEn.split(";").filter(Boolean) : [],
            tribeAr: record.tribeAr || "",
            tribeEn: record.tribeEn || "",
            birthYearAH: parseInt(record.birthYearAH) || -40,
            deathYearAH: parseInt(record.deathYearAH) || 15,
            ageAtDeath: parseInt(record.ageAtDeath) || 60,
            category: (record.category || "Other") as CompanionCategory,
            cityAr: record.cityAr || "المدينة المنورة",
            cityEn: record.cityEn || "Medina",
            hadithCount: parseInt(record.hadithCount) || 0,
            shortBioAr: record.shortBioAr || "",
            shortBioEn: record.shortBioEn || "",
            longBioAr: record.longBioAr || record.shortBioAr || "",
            longBioEn: record.longBioEn || record.shortBioEn || "",
            conversionAr: record.conversionAr || "",
            conversionEn: record.conversionEn || "",
            achievementsAr: record.achievementsAr ? record.achievementsAr.split(";").filter(Boolean) : [],
            achievementsEn: record.achievementsEn ? record.achievementsEn.split(";").filter(Boolean) : [],
            battles: record.battles ? record.battles.split(";").filter(Boolean) : [],
            teachers: record.teachers ? record.teachers.split(";").filter(Boolean) : ["الرسول محمد ﷺ"],
            students: record.students ? record.students.split(";").filter(Boolean) : [],
            famousHadiths: [],
            sources: record.sources ? record.sources.split(";").filter(Boolean) : ["كتاب التراث"],
            library: record.library ? record.library.split(";").filter(Boolean) : [],
            historicalSignificanceAr: record.historicalSignificanceAr || "",
            historicalSignificanceEn: record.historicalSignificanceEn || "",
            confidenceLevel: (record.confidenceLevel || "High") as 'High' | 'Medium' | 'Low',
            gender: (record.gender || "Male") as 'Male' | 'Female'
          };

          compsBatch.set(db.collection("companions").doc(comp.id), comp);
          addedCount++;
        }
      }

      await compsBatch.commit();

      const historyId = "hist_" + Date.now();
      await db.collection("history").doc(historyId).set({
        id: historyId,
        timestamp: new Date().toISOString(),
        action: "IMPORT_CSV",
        administrator: user.name,
        reason: `Imported ${addedCount} companions from CSV file.`,
      });

      res.json({ success: true, companionsAdded: addedCount });
    } else {
      res.status(400).json({ error: "Unsupported format" });
    }
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Import failed: " + e.message });
  }
});

// POST /api/admin/upload
app.post("/api/admin/upload", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const { fileName, content, fileType } = req.body;
    if (!fileName || !content) {
      return res.status(400).json({ error: "fileName and content fields are required." });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    
    // Save base64 media asset strictly and persistently to firestore uploads collection
    await db.collection("uploads").doc(safeName).set({
      fileName: safeName,
      content, // base64 payload
      fileType: fileType || "photo",
      uploadedBy: user.email,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      fileName: safeName,
      title: safeName.split(".")[0],
      type: fileType || "photo"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to persist file upload: " + err.message });
  }
});

// GET /uploads/:name (Stateless live serving from Firestore)
app.get("/uploads/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const docSnap = await db.collection("uploads").doc(name).get();
    if (docSnap.exists) {
      const data = docSnap.data()!;
      const buffer = Buffer.from(data.content, "base64");

      let contentType = "application/octet-stream";
      const nameLower = name.toLowerCase();
      if (nameLower.endsWith(".png")) contentType = "image/png";
      else if (nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (nameLower.endsWith(".gif")) contentType = "image/gif";
      else if (nameLower.endsWith(".svg")) contentType = "image/svg+xml";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(buffer);
    } else {
      res.status(404).send("Upload resource not found");
    }
  } catch (err: any) {
    res.status(500).send("Upload retrieve failure: " + err.message);
  }
});

// POST /api/research (Smart content generator via Google Gemini)
app.post("/api/research", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query name is required for AI Research." });
  }

  if (!ai) {
    return res.status(503).json({
      error: "Gemini API client is not configured. Please add GEMINI_API_KEY to your Secrets.",
    });
  }

  try {
    console.log(`Researching companion with Gemini API: ${query}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Produce high-quality historical encyclopedia data about the companion (Sahabi) of Prophet Muhammad ﷺ with name/query: "${query}".
You MUST generate clean, rich, valid JSON matching the following JSON structure. All historical claims must be validated with classical references. Ensure biographies are Seerah-style and detailed. Provide responses in BOTH Arabic (RTL primary) and English translation.

JSON structure:
{
  "id": "slugified_english_id (e.g., saad_bin_muadh)",
  "nameAr": "Arabic full name with honorifics like رضي الله عنه",
  "nameEn": "English transliteration of full name",
  "kunyaAr": "Kunya in Arabic (e.g. أبو شجاع)",
  "kunyaEn": "Kunya in English (e.g. Abu Shuja)",
  "lineageAr": "Full genealogical lineage in Arabic (e.g. سعد بن معاذ بن النعمان...)",
  "lineageEn": "Full genealogical lineage in English",
  "titlesAr": ["Arabic title 1", "Arabic title 2"],
  "titlesEn": ["English title 1 (Trans)"],
  "tribeAr": "e.g. الأوس (the tribe)",
  "tribeEn": "e.g. Al-Aws",
  "birthYearAH": -30,
  "deathYearAH": 5,
  "ageAtDeath": 37,
  "category": "One of: ['Khulafa_Rashidun', 'Ahl_al_Bayt', 'Muhajirun', 'Ansar', 'Wives', 'Hadith_Narrators', 'Military', 'Scholars', 'Other']",
  "cityAr": "مكة or المدينة المنورة or الكوفة or البصرة etc.",
  "cityEn": "Medina or Mecca or Basra etc.",
  "hadithCount": 24,
  "shortBioAr": "Compelling short bio in Arabic...",
  "shortBioEn": "Compelling short bio in English...",
  "longBioAr": "Paragraph 1 describing early life in Arabic.\\n\\nParagraph 2 describing highlights in Arabic.\\n\\nParagraph 3 describing their death or late career in Arabic.",
  "longBioEn": "Paragraph 1 describing life in English.\\n\\nParagraph 2 highlights in English.\\n\\nParagraph 3 narrative in English.",
  "conversionAr": "Explanation of how and when they accepted Islam in Arabic.",
  "conversionEn": "Explanation of how and when they accepted Islam in English.",
  "achievementsAr": ["Achievement bullet 1 in Arabic", "Achievement bullet 2 in Arabic"],
  "achievementsEn": ["Achievement bullet 1 in English", "Achievement bullet 2 in English"],
  "battles": ["badr", "uhud", "khandaq"],
  "teachers": ["الرسول محمد ﷺ"],
  "students": ["example student 1", "student 2"],
  "famousHadiths": [
    {
      "quoteAr": "famous hadith quote with diacritics...",
      "quoteEn": "English translation of that hadith.",
      "reference": "Classical source e.g., Sahih al-Bukhari 2345"
    }
  ],
  "sources": ["صحيح البخاري", "سير أعلام النبلاء", "أسد الغابة"],
  "library": ["Book reference 1", "Book reference 2"],
  "historicalSignificanceAr": "Historical impact explanation in Arabic.",
  "historicalSignificanceEn": "Historical impact explanation in English.",
  "confidenceLevel": "High"
}

Return ONLY this raw JSON object, without markdown wraps, or backticks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            nameAr: { type: Type.STRING },
            nameEn: { type: Type.STRING },
            kunyaAr: { type: Type.STRING },
            kunyaEn: { type: Type.STRING },
            lineageAr: { type: Type.STRING },
            lineageEn: { type: Type.STRING },
            titlesAr: { type: Type.ARRAY, items: { type: Type.STRING } },
            titlesEn: { type: Type.ARRAY, items: { type: Type.STRING } },
            tribeAr: { type: Type.STRING },
            tribeEn: { type: Type.STRING },
            birthYearAH: { type: Type.INTEGER },
            deathYearAH: { type: Type.INTEGER },
            ageAtDeath: { type: Type.INTEGER },
            category: { type: Type.STRING },
            cityAr: { type: Type.STRING },
            cityEn: { type: Type.STRING },
            hadithCount: { type: Type.INTEGER },
            shortBioAr: { type: Type.STRING },
            shortBioEn: { type: Type.STRING },
            longBioAr: { type: Type.STRING },
            longBioEn: { type: Type.STRING },
            conversionAr: { type: Type.STRING },
            conversionEn: { type: Type.STRING },
            achievementsAr: { type: Type.ARRAY, items: { type: Type.STRING } },
            achievementsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
            battles: { type: Type.ARRAY, items: { type: Type.STRING } },
            teachers: { type: Type.ARRAY, items: { type: Type.STRING } },
            students: { type: Type.ARRAY, items: { type: Type.STRING } },
            famousHadiths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quoteAr: { type: Type.STRING },
                  quoteEn: { type: Type.STRING },
                  reference: { type: Type.STRING }
                },
                required: ["quoteAr", "quoteEn", "reference"]
              }
            },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
            library: { type: Type.ARRAY, items: { type: Type.STRING } },
            historicalSignificanceAr: { type: Type.STRING },
            historicalSignificanceEn: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING }
          },
          required: [
            "id", "nameAr", "nameEn", "kunyaAr", "kunyaEn",
            "lineageAr", "lineageEn", "titlesAr", "titlesEn",
            "tribeAr", "tribeEn", "birthYearAH", "deathYearAH", "ageAtDeath",
            "category", "cityAr", "cityEn", "hadithCount",
            "shortBioAr", "shortBioEn", "longBioAr", "longBioEn",
            "conversionAr", "conversionEn", "achievementsAr", "achievementsEn",
            "battles", "teachers", "students", "famousHadiths",
            "sources", "library", "historicalSignificanceAr", "historicalSignificanceEn",
            "confidenceLevel"
          ]
        }
      }
    });

    const textOutput = response.text || "{}";
    const parsedData = JSON.parse(textOutput.trim());
    res.json(parsedData);
  } catch (e: any) {
    console.error("Gemini API Error details:", e);
    res.status(500).json({ error: "Failed to generate companion context: " + (e.message || e) });
  }
});

// Export Express app instance directly for Vercel Serverless Function loading
export default app;
