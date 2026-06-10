/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini SDK with telemetry header
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

// Paths for persistence
const DATA_DIR = path.join(process.cwd(), "data");
const COMPANIONS_FILE = path.join(DATA_DIR, "companions.json");
const RELATIONSHIPS_FILE = path.join(DATA_DIR, "relationships.json");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");
const PENDING_CHANGES_FILE = path.join(DATA_DIR, "pending_changes.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

import { DEFAULT_COMPANIONS, DEFAULT_RELATIONSHIPS } from "./src/data/defaultDataset";
import { Companion, Relationship, CompanionCategory } from "./src/types";
import crypto from "crypto";

// Sessions map for auth: token -> user
const SESSIONS: Record<string, { email: string; name: string; role: string }> = {};

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function loadAdmins(): any[] {
  if (fs.existsSync(ADMINS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading admins.json", e);
    }
  }
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
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(defaultAdmins, null, 2), "utf-8");
  return defaultAdmins;
}

function saveAdmins(admins: any[]) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
}

function loadPendingChanges(): any[] {
  if (fs.existsSync(PENDING_CHANGES_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PENDING_CHANGES_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading pending_changes.json", e);
    }
  }
  fs.writeFileSync(PENDING_CHANGES_FILE, JSON.stringify([], null, 2), "utf-8");
  return [];
}

function savePendingChanges(changes: any[]) {
  fs.writeFileSync(PENDING_CHANGES_FILE, JSON.stringify(changes, null, 2), "utf-8");
}

function loadHistory(): any[] {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading history.json", e);
    }
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), "utf-8");
  return [];
}

function saveHistory(history: any[]) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

// Helper to load dataset
function loadCompanions(): Companion[] {
  if (fs.existsSync(COMPANIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(COMPANIONS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading companions.json, resetting to defaults", e);
    }
  }
  // Bootstrap with default dataset
  fs.writeFileSync(COMPANIONS_FILE, JSON.stringify(DEFAULT_COMPANIONS, null, 2), "utf-8");
  return DEFAULT_COMPANIONS;
}

function loadRelationships(): Relationship[] {
  if (fs.existsSync(RELATIONSHIPS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(RELATIONSHIPS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading relationships.json, resetting to defaults", e);
    }
  }
  // Bootstrap with default dataset
  fs.writeFileSync(RELATIONSHIPS_FILE, JSON.stringify(DEFAULT_RELATIONSHIPS, null, 2), "utf-8");
  return DEFAULT_RELATIONSHIPS;
}

// Save helpers
function saveCompanions(data: Companion[]) {
  fs.writeFileSync(COMPANIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function saveRelationships(data: Relationship[]) {
  fs.writeFileSync(RELATIONSHIPS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json({ limit: "15mb" }));

  // API: Get all companions
  app.get("/api/companions", (req, res) => {
    const companions = loadCompanions();
    res.json(companions);
  });

  // API: Get all relationships
  app.get("/api/relationships", (req, res) => {
    const relations = loadRelationships();
    res.json(relations);
  });

  // API: Add new companion
  app.post("/api/companions", (req, res) => {
    const companion: Companion = req.body;
    if (!companion.id || !companion.nameAr || !companion.nameEn) {
      return res.status(400).json({ error: "Missing required companion field (id, nameAr, nameEn)" });
    }
    const companions = loadCompanions();
    // Check duplication
    if (companions.some(c => c.id === companion.id)) {
      return res.status(400).json({ error: "Companion with this ID already exists." });
    }
    companions.push(companion);
    saveCompanions(companions);
    res.status(201).json(companion);
  });

  // API: Edit existing companion
  app.put("/api/companions/:id", (req, res) => {
    const { id } = req.params;
    const updatedCompanion: Companion = req.body;
    const companions = loadCompanions();
    const index = companions.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Companion not found." });
    }
    companions[index] = { ...updatedCompanion, id }; // Ensure ID stays unchanged
    saveCompanions(companions);
    res.json(companions[index]);
  });

  // API: Delete companion
  app.delete("/api/companions/:id", (req, res) => {
    const { id } = req.params;
    let companions = loadCompanions();
    const exists = companions.some(c => c.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Companion not found" });
    }
    companions = companions.filter(c => c.id !== id);
    saveCompanions(companions);

    // Also cascade delete associated relationships
    let relations = loadRelationships();
    relations = relations.filter(r => r.sourceId !== id && r.targetId !== id);
    saveRelationships(relations);

    res.json({ success: true, deletedId: id });
  });

  // API: Add relationship
  app.post("/api/relationships", (req, res) => {
    const relation: Relationship = req.body;
    if (!relation.id || !relation.sourceId || !relation.targetId || !relation.type) {
      return res.status(400).json({ error: "Missing required fields (id, sourceId, targetId, type)" });
    }
    const relations = loadRelationships();
    relations.push(relation);
    saveRelationships(relations);
    res.status(201).json(relation);
  });

  // API: Delete relationship
  app.delete("/api/relationships/:id", (req, res) => {
    const { id } = req.params;
    let relations = loadRelationships();
    const exists = relations.some(r => r.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Relationship not found" });
    }
    relations = relations.filter(r => r.id !== id);
    saveRelationships(relations);
    res.json({ success: true, deletedId: id });
  });

  // Helper to retrieve user details from token
  function getSessionUser(req: express.Request) {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.toString().replace("Bearer ", "").trim();
    return SESSIONS[token] || null;
  }

  // API: Reset dataset
  app.post("/api/reset", (req, res) => {
    saveCompanions(DEFAULT_COMPANIONS);
    saveRelationships(DEFAULT_RELATIONSHIPS);
    res.json({ success: true, companions: DEFAULT_COMPANIONS, relationships: DEFAULT_RELATIONSHIPS });
  });

  // API: Stats and summary
  app.get("/api/stats", (req, res) => {
    const companions = loadCompanions();
    const relationships = loadRelationships();
    const categoriesCount: Record<string, number> = {};
    companions.forEach(c => {
      categoriesCount[c.category] = (categoriesCount[c.category] || 0) + 1;
    });

    res.json({
      companionsCount: companions.length,
      relationshipsCount: relationships.length,
      categoriesCount,
    });
  });

  // API Authenticated: Admin login
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const admins = loadAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!admin || hashPassword(password) !== admin.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = crypto.randomBytes(16).toString("hex");
    SESSIONS[token] = { email: admin.email, name: admin.name, role: admin.role };

    res.json({ token, user: { email: admin.email, name: admin.name, role: admin.role } });
  });

  // API Authenticated: Admin logout
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.toString().replace("Bearer ", "").trim();
    if (token && SESSIONS[token]) {
      delete SESSIONS[token];
    }
    res.json({ success: true });
  });

  // API Authenticated: Get Administrators (Super Admin only)
  app.get("/api/admin/users", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const admins = loadAdmins().map(({ passwordHash, ...rest }) => rest);
    res.json(admins);
  });

  // API Authenticated: Add Administrator (Super Admin only)
  app.post("/api/admin/users", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const admins = loadAdmins();
    if (admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Administrator email already exists." });
    }
    admins.push({
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name,
      role
    });
    saveAdmins(admins);
    res.status(201).json({ email, name, role });
  });

  // API Authenticated: Delete Administrator (Super Admin only)
  app.delete("/api/admin/users/:email", (req, res) => {
    const user = getSessionUser(req);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin role." });
    }
    const { email } = req.params;
    if (email.toLowerCase() === "superadmin@sahaba.org") {
      return res.status(400).json({ error: "Cannot delete the bootstrap Super Admin account." });
    }
    let admins = loadAdmins();
    const beforeLength = admins.length;
    admins = admins.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    if (admins.length === beforeLength) {
      return res.status(404).json({ error: "Administrator not found." });
    }
    saveAdmins(admins);
    res.json({ success: true });
  });

  // API Authenticated: Get history logs
  app.get("/api/admin/history", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const history = loadHistory();
    res.json(history.reverse()); // return newest first
  });

  // API Authenticated: Get pending proposals
  app.get("/api/admin/pending", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const pending = loadPendingChanges();
    res.json(pending);
  });

  // API Authenticated: Propose/Approve change workflow
  app.post("/api/admin/pending", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const { type, itemId, previousValue, newValue, reason } = req.body;
    if (!type || !newValue) {
      return res.status(400).json({ error: "Proposing changes requires type and newValue" });
    }

    const pending = loadPendingChanges();
    const isDirectApproved = user.role === "Super Admin" || user.role === "Reviewer";

    const proposal = {
      id: "prop_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
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
      // Execute change directly!
      try {
        applyProposalStateChanges(proposal, user.name);
      } catch (e: any) {
        return res.status(500).json({ error: "Direct approval application failed: " + e.message });
      }
    }

    pending.push(proposal);
    savePendingChanges(pending);

    res.status(201).json(proposal);
  });

  // API Authenticated: Approve pending proposal (Super Admin or Reviewer only)
  app.post("/api/admin/pending/:id/approve", (req, res) => {
    const user = getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { id } = req.params;
    const pending = loadPendingChanges();
    const idx = pending.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    const proposal = pending[idx];
    if (proposal.status !== "pending") {
      return res.status(400).json({ error: "Proposal is already " + proposal.status });
    }

    try {
      applyProposalStateChanges(proposal, user.name);
      proposal.status = "approved";
      proposal.approverName = user.name;
      proposal.approvedAt = new Date().toISOString();
      pending[idx] = proposal;
      savePendingChanges(pending);
      res.json(proposal);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to apply changes: " + e.message });
    }
  });

  // API Authenticated: Reject pending proposal (Super Admin or Reviewer only)
  app.post("/api/admin/pending/:id/reject", (req, res) => {
    const user = getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { id } = req.params;
    const pending = loadPendingChanges();
    const idx = pending.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    const proposal = pending[idx];
    if (proposal.status !== "pending") {
      return res.status(400).json({ error: "Proposal is already finished." });
    }

    proposal.status = "rejected";
    proposal.approverName = user.name;
    proposal.approvedAt = new Date().toISOString();
    pending[idx] = proposal;
    savePendingChanges(pending);

    res.json(proposal);
  });

  // Core helper to apply approved modifications
  function applyProposalStateChanges(proposal: any, approverName: string) {
    const { type, newValue, itemId } = proposal;
    const historyObj: any = {
      id: "hist_" + Date.now(),
      timestamp: new Date().toISOString(),
      action: type,
      itemId: itemId || newValue.id,
      itemName: newValue.nameEn || itemId || "System Asset",
      administrator: proposal.editorName,
      approvedBy: approverName,
      reason: proposal.reason,
      previousValue: proposal.previousValue
    };

    if (type === "create_companion" || type === "edit_companion") {
      const companions = loadCompanions();
      const existingIdx = companions.findIndex(c => c.id === newValue.id);
      if (existingIdx === -1) {
        companions.push(newValue);
      } else {
        companions[existingIdx] = newValue;
      }
      saveCompanions(companions);
      historyObj.newValue = newValue;
    } else if (type === "delete_companion") {
      let companions = loadCompanions();
      companions = companions.filter(c => c.id !== itemId);
      saveCompanions(companions);

      // Cascade delete relationships pointing to it
      let relations = loadRelationships();
      relations = relations.filter(r => r.sourceId !== itemId && r.targetId !== itemId);
      saveRelationships(relations);
    } else if (type === "create_relationship") {
      const relations = loadRelationships();
      relations.push(newValue);
      saveRelationships(relations);
      historyObj.newValue = newValue;
    } else if (type === "delete_relationship") {
      let relations = loadRelationships();
      relations = relations.filter(r => r.id !== itemId);
      saveRelationships(relations);
    }

    const history = loadHistory();
    history.push(historyObj);
    saveHistory(history);
  }

  // API Authenticated: Detailed maintenance stats reports
  app.get("/api/admin/stats-reports", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const companions = loadCompanions();
    const relationships = loadRelationships();
    const pending = loadPendingChanges().filter(p => p.status === "pending");

    // Women companions
    const womenCount = companions.filter(c => c.gender === "Female").length;

    // Quality stats completeness percent
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

    // Suspected duplicates calculator
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
      pendingTotal: pending.length,
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
  });

  // API Authenticated: Merge duplicate companions
  app.post("/api/admin/merge", (req, res) => {
    const user = getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Only Super Admins or Reviewers can merge duplicate records." });
    }
    const { sourceId, targetId, mergeFields } = req.body;
    if (!sourceId || !targetId) {
      return res.status(400).json({ error: "Source and Target IDs are required" });
    }

    const companions = loadCompanions();
    const sourceIndex = companions.findIndex(c => c.id === sourceId);
    const targetIndex = companions.findIndex(c => c.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) {
      return res.status(404).json({ error: "Source or Target companion not found" });
    }

    const sourceComp = companions[sourceIndex];
    const targetComp = companions[targetIndex];

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

    // Remove the source companion
    companions.splice(sourceIndex, 1);
    saveCompanions(companions);

    // Update relationships to use targetId instead of sourceId
    const relations = loadRelationships();
    let relationsUpdatedCount = 0;
    relations.forEach(r => {
      if (r.sourceId === sourceId) {
        r.sourceId = targetId;
        relationsUpdatedCount++;
      }
      if (r.targetId === sourceId) {
        r.targetId = targetId;
        relationsUpdatedCount++;
      }
    });
    if (relationsUpdatedCount > 0) {
      saveRelationships(relations);
    }

    // Log history
    const history = loadHistory();
    history.push({
      id: "hist_" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "MERGE_COMPANION",
      itemId: targetId,
      itemName: targetComp.nameEn,
      administrator: user.name,
      reason: `Merged duplicate record ${sourceComp.nameEn} (removed) into ${targetComp.nameEn}.`,
      previousValue: previousKeeperValue,
      newValue: targetComp
    });
    saveHistory(history);

    res.json({ success: true, targetId, mergedRelationships: relationsUpdatedCount });
  });

  // API Authenticated: Export full database JSON backup
  app.get("/api/admin/export", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }
    const companions = loadCompanions();
    const relationships = loadRelationships();
    const history = loadHistory();
    const pending = loadPendingChanges();
    const admins = loadAdmins().map(({ passwordHash, ...rest }) => rest);

    res.json({
      companions,
      relationships,
      history,
      pending,
      admins,
      checksum: crypto.createHash("md5").update(JSON.stringify(companions)).digest("hex")
    });
  });

  // API Authenticated: Import backing database CSV/JSON
  app.post("/api/admin/import", (req, res) => {
    const user = getSessionUser(req);
    if (!user || (user.role !== "Super Admin" && user.role !== "Reviewer")) {
      return res.status(403).json({ error: "Unauthorized. Requires Super Admin or Reviewer role." });
    }

    const { format, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    try {
      if (format === "json") {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;

        let companionsAdded = 0;
        let relationshipsAdded = 0;

        const currentCompanions = loadCompanions();
        const currentRelationships = loadRelationships();

        if (parsed.companions && Array.isArray(parsed.companions)) {
          parsed.companions.forEach((c: any) => {
            if (c.id && c.nameAr && c.nameEn) {
              const idx = currentCompanions.findIndex(exc => exc.id === c.id);
              if (idx === -1) {
                currentCompanions.push(c);
              } else {
                currentCompanions[idx] = c;
              }
              companionsAdded++;
            }
          });
          if (parsed.relationships && Array.isArray(parsed.relationships)) {
            parsed.relationships.forEach((r: any) => {
              if (r.id && r.sourceId && r.targetId) {
                if (!currentRelationships.some(exr => exr.id === r.id)) {
                  currentRelationships.push(r);
                  relationshipsAdded++;
                }
              }
            });
          }
        } else if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c.id && c.nameAr && c.nameEn) {
              const idx = currentCompanions.findIndex(exc => exc.id === c.id);
              if (idx === -1) {
                currentCompanions.push(c);
              } else {
                currentCompanions[idx] = c;
              }
              companionsAdded++;
            }
          });
        } else {
          return res.status(400).json({ error: "Invalid backup JSON schema structure" });
        }

        saveCompanions(currentCompanions);
        saveRelationships(currentRelationships);

        const history = loadHistory();
        history.push({
          id: "hist_" + Date.now(),
          timestamp: new Date().toISOString(),
          action: "IMPORT_BACKUP",
          administrator: user.name,
          reason: `Imported backup containing ${companionsAdded} companions and ${relationshipsAdded} relations.`,
        });
        saveHistory(history);

        return res.json({ success: true, companionsAdded, relationshipsAdded });
      } else if (format === "csv") {
        const lines = data.split(/\r?\n/);
        if (lines.length < 2) {
          return res.status(400).json({ error: "Empty or invalid CSV file." });
        }

        const header = lines[0].split(",").map((h: string) => h.replace(/["']/g, "").trim());
        const currentCompanions = loadCompanions();
        let addedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const l = lines[i].trim();
          if (!l) continue;

          // Simple CSV splitter
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

            const existingIdx = currentCompanions.findIndex(c => c.id === comp.id);
            if (existingIdx === -1) {
              currentCompanions.push(comp);
            } else {
              currentCompanions[existingIdx] = comp;
            }
            addedCount++;
          }
        }

        saveCompanions(currentCompanions);

        const history = loadHistory();
        history.push({
          id: "hist_" + Date.now(),
          timestamp: new Date().toISOString(),
          action: "IMPORT_CSV",
          administrator: user.name,
          reason: `Imported ${addedCount} companions from CSV file.`,
        });
        saveHistory(history);

        res.json({ success: true, companionsAdded: addedCount });
      } else {
        res.status(400).json({ error: "Unsupported format" });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Import failed: " + e.message });
    }
  });

  // API Authenticated: Handle image/media simulation uploads
  app.post("/api/admin/upload", (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Admin session required." });
    }

    const { fileName, content, fileType } = req.body; // base64 content
    if (!fileName || !content) {
      return res.status(400).json({ error: "fileName and content fields are required." });
    }

    try {
      const uploadDir = path.join(DATA_DIR, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      const buffer = Buffer.from(content, "base64");
      const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const targetPath = path.join(uploadDir, safeName);
      fs.writeFileSync(targetPath, buffer);

      res.json({
        success: true,
        url: `/uploads/${safeName}`,
        fileName: safeName,
        title: safeName.split(".")[0],
        type: fileType || "photo"
      });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to upload file: " + e.message });
    }
  });

  // Route to safely serve uploaded content
  app.get("/uploads/:name", (req, res) => {
    const { name } = req.params;
    const targetPath = path.join(DATA_DIR, "uploads", name);
    if (fs.existsSync(targetPath)) {
      res.sendFile(targetPath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // API: AI Research companion via Gemini
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
  "birthYearAH": -30 (birth year, negative if before Hijri / BH. If unknown, approximate or set close guess, e.g. -35 BH),
  "deathYearAH": 5 (Hijri year of death),
  "ageAtDeath": 37,
  "category": "One of: ['Khulafa_Rashidun', 'Ahl_al_Bayt', 'Muhajirun', 'Ansar', 'Wives', 'Hadith_Narrators', 'Military', 'Scholars', 'Other']",
  "cityAr": "مكة or المدينة المنورة or الكوفة or البصرة etc.",
  "cityEn": "Medina or Mecca or Basra etc.",
  "hadithCount": 24 (approx number of hadiths narrated),
  "shortBioAr": "Compelling short bio in Arabic...",
  "shortBioEn": "Compelling short bio in English...",
  "longBioAr": "Paragraph 1 describing early life in Arabic.\\n\\nParagraph 2 describing highlights in Arabic.\\n\\nParagraph 3 describing their death or late career in Arabic.",
  "longBioEn": "Paragraph 1 describing life in English.\\n\\nParagraph 2 highlights in English.\\n\\nParagraph 3 narrative in English.",
  "conversionAr": "Explanation of how and when they accepted Islam in Arabic.",
  "conversionEn": "Explanation of how and when they accepted Islam in English.",
  "achievementsAr": ["Achievement bullet 1 in Arabic", "Achievement bullet 2 in Arabic"],
  "achievementsEn": ["Achievement bullet 1 in English", "Achievement bullet 2 in English"],
  "battles": ["badr", "uhud", "khandaq" (strictly use lowercase strings from the list of battle IDs: 'badr', 'uhud', 'khandaq', 'khaybar', 'mutah', 'hunayn', 'tabuk' if they participated, else empty array)],
  "teachers": ["الرسول محمد ﷺ"],
  "students": ["example student 1 in Arabic", "student 2 in Arabic"],
  "famousHadiths": [
    {
      "quoteAr": "famous hadith quote attributed to or narrated by them in Arabic with diacritics if possible...",
      "quoteEn": "English translation of that hadith.",
      "reference": "Classical source e.g., Sahih al-Bukhari 2345"
    }
  ],
  "sources": ["صحيح البخاري", "سير أعلام النبلاء", "أسد الغابة"],
  "library": ["Book reference 1", "Book reference 2"],
  "historicalSignificanceAr": "Historical impact explanation in Arabic.",
  "historicalSignificanceEn": "Historical impact explanation in English.",
  "confidenceLevel": "High" (One of: "High", "Medium", "Low")
}

Return ONLY this raw JSON object, without markdown wraps, or backticks, so it is parseable. If you cannot avoid markdown wraps, provide only the JSON content inside.`,
        config: {
          responseMimeType: "application/json",
          // Set response schema to enforce the precise fields
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


  // Integrate Vite for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sahaba Explorer Server running on http://localhost:${PORT}`);
  });
}

startServer();
