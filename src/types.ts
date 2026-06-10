/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Category types for Companion categorization
export type CompanionCategory =
  | 'Khulafa_Rashidun'   // Khulafa al-Rashidun
  | 'Ahl_al_Bayt'       // Ahl al-Bayt
  | 'Muhajirun'         // Muhajirun
  | 'Ansar'             // Ansar
  | 'Wives'             // Wives of the Prophet ﷺ
  | 'Hadith_Narrators'  // Major Hadith Narrators
  | 'Military'          // Military Commanders
  | 'Scholars'          // Scholars / Jurists
  | 'Other';            // Other famous Sahaba

export interface TimelineEvent {
  id: string;
  yearAH: number;       // Year in Hijri (positive or negative for BH)
  yearCE: number;       // Year in Common Era (approximate)
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export interface HadithQuote {
  quoteAr: string;
  quoteEn: string;
  reference: string;    // e.g., "Sahih al-Bukhari 1234"
}

export interface Companion {
  id: string;           // E.g., "abu_bakr"
  nameAr: string;       // Name in Arabic
  nameEn: string;       // English Transliteration
  kunyaAr: string;      // Kunya in Arabic
  kunyaEn: string;      // Kunya in English
  lineageAr: string;    // Full lineage in Arabic
  lineageEn: string;    // Full lineage in English
  titlesAr: string[];   // Titles in Arabic
  titlesEn: string[];   // Titles in English
  tribeAr: string;      // Tribe in Arabic
  tribeEn: string;      // Tribe in English
  birthYearAH: number;  // approx. Year AH index (negative is BH, e.g., -50 BH)
  deathYearAH: number;  // Year AH of death (e.g., 13 AH)
  ageAtDeath: number;
  category: CompanionCategory;
  cityAr: string;       // e.g., مكة, المدينة
  cityEn: string;       // e.g., Mecca, Medina
  hadithCount: number;  // number of hadiths narrated

  // Biography Summaries
  shortBioAr: string;
  shortBioEn: string;
  longBioAr: string;    // Comprehensive Seerah-style biography (Markdown supported)
  longBioEn: string;

  // Conversion Narrative
  conversionAr: string;
  conversionEn: string;

  // Achievements
  achievementsAr: string[];
  achievementsEn: string[];

  // Lists of associations
  battles: string[];    // IDs of battles participated (e.g., ["badr", "uhud"])
  teachers: string[];   // Names of Teachers
  students: string[];   // Names of Students
  famousHadiths: HadithQuote[];

  // Historical Sources & References
  sources: string[];    // Classical sources referenced, e.g., ["Sahih al-Bukhari", "Ibn Hisham"]
  library: string[];    // Academic books or reference collections

  // Extra details
  historicalSignificanceAr: string;
  historicalSignificanceEn: string;
  confidenceLevel: 'High' | 'Medium' | 'Low'; // Data confidence ranking based on historical agreements

  // Newly added fields for admin console
  alternativeNamesAr?: string[];
  alternativeNamesEn?: string[];
  gender?: 'Male' | 'Female';
  birthPlaceAr?: string;
  birthPlaceEn?: string;
  deathPlaceAr?: string;
  deathPlaceEn?: string;
  externalLinks?: string[];
  mediaUrls?: { type: 'photo' | 'map' | 'document'; url: string; title: string; }[];
}

export type RelationshipType =
  | 'family'            // Family relationship (father, cousin, child, etc.)
  | 'marriage'          // Marriage relation (wife, husband)
  | 'teacher_student'   // Teacher / Student guidance
  | 'friendship'        // Close personal companionship
  | 'hijra_partner'     // Migrated together
  | 'battle_comrade'    // Fought side-by-side in key expedition
  | 'political'         // Governance / Alliance / Shura links
  | 'hadith_transmission'; // Hadith transmission link

export interface Relationship {
  id: string;
  sourceId: string;     // Companion ID
  targetId: string;     // Companion ID
  type: RelationshipType;
  labelAr: string;      // Relation description in Arabic
  labelEn: string;      // Relation description in English
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface BattleInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  yearAH: number;
  locationAr: string;
  locationEn: string;
  summaryAr: string;
  summaryEn: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  tribe: string;
  battle: string;
  city: string;
  minHadiths: number;
  relationshipType: string;
}
