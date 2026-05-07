/**
 * locationTypes.ts
 *
 * Type definitions for ATS location data.
 *
 * Two shapes are modeled here deliberately. The forensic hypothesis is that
 * the observed label inconsistency could originate from either:
 *
 *   (a) a preformatted string field stored directly in the ATS record, or
 *   (b) a structured record whose fields are composed into a label at render
 *       time without adequate normalization.
 *
 * A production fix likely needs to address both. The normalization utilities
 * in this repository handle the defensive rendering layer (shape b → label
 * and raw string label cleanup). Schema-level validation at write time is the
 * complementary backend concern.
 */

/** Workplace arrangement type. */
export type WorkplaceType = 'office' | 'hybrid' | 'remote';

/**
 * A structured ATS location record.
 *
 * Represents the hypothetical shape of a location object if the ATS stores
 * location as discrete fields rather than a single preformatted string.
 * `region` may be a full state name ("New York") or an abbreviation ("NY") —
 * that ambiguity is the normalization problem being modeled.
 */
export interface AtsLocationRecord {
  id: string;
  workplaceType: WorkplaceType;
  city?: string;
  region?: string;
  country?: string;
  /** Preformatted label as returned by the API, if present. */
  rawLabel?: string;
}

/**
 * A normalized, canonical location record.
 * Produced by running an AtsLocationRecord through the normalization pipeline.
 */
export interface CanonicalLocation {
  id: string;
  workplaceType: WorkplaceType;
  city: string;
  region: string;
  country: string;
  /** The canonical display label derived from normalized fields. */
  label: string;
  /** The original raw label before normalization, if one was present. */
  originalLabel?: string;
}

/**
 * The result of a normalization audit on a set of raw location strings.
 * Used by the audit script to report delta between raw and canonical.
 */
export interface NormalizationAuditResult {
  totalRaw: number;
  totalCanonical: number;
  deduplicationSavings: number;
  changed: Array<{ raw: string; canonical: string }>;
  unchanged: string[];
}
