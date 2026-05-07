/**
 * detectNearDuplicateLabels.ts
 *
 * AI-assisted near-duplicate location label detector.
 *
 * Run: npm run detect-dupes
 *
 * This script sends a set of location strings to Claude and asks it to
 * identify semantically similar labels that may represent the same location
 * but appear as distinct strings. It outputs a human-readable anomaly report.
 *
 * IMPORTANT — role of this script in the CI pipeline:
 *
 *   This script is NON-BLOCKING. It annotates potential issues for human
 *   review but does not gate the build. Deterministic checks (fixtureValidation
 *   tests) gate the build. AI assists; it does not decide.
 *
 *   Rationale: LLM outputs are probabilistic. Using them as a hard CI gate
 *   would introduce non-determinism into the release pipeline. Their value here
 *   is catching edge cases that regex-based normalization hasn't seen yet —
 *   surfacing them for a human to decide whether a new rule is warranted.
 *
 * See docs/ai-usage.md for the full governance rationale.
 */

import { RAW_OBSERVED_LABELS } from '../src/mockAtsPayload.js';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a data quality reviewer for an Applicant Tracking System.

Your task: given a list of location strings, identify groups of labels that
appear to represent the same canonical location but are formatted differently.

For each group of near-duplicates you find:
- List the variant strings
- Identify what the canonical form should be
- Name the specific formatting issue (e.g. "space before comma", "full state name vs abbreviation")

If all labels are already canonical and distinct, say so clearly.

Be conservative. Only group strings you are highly confident represent the same
location. Do not guess at ambiguous cases.

Respond in this format:

NEAR-DUPLICATE GROUPS FOUND: <n>

Group 1:
  Variants: [list]
  Canonical: <string>
  Issue: <description>

...

RECOMMENDATION:
<one paragraph summary of what a normalization rule should address>`;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function detectNearDuplicates(labels: string[]): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log('\n[detect-dupes] ANTHROPIC_API_KEY is not set. Skipping advisory review.');
    console.log('[detect-dupes] NOTE: This is expected for local runs and unconfigured CI.\n');
    return;
  }

  console.log('\n[detect-dupes] Sending label set to Claude for anomaly review...');
  console.log('[detect-dupes] NOTE: This is a non-blocking review. Results are advisory only.\n');

  const labelList = labels.map((l, i) => `${i + 1}. "${l}"`).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Review these location strings for near-duplicates:\n\n${labelList}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';

    console.log('══════════════════════════════════════════════════════');
    console.log('  AI-Assisted Near-Duplicate Label Report');
    console.log('  Model: claude-sonnet (non-blocking advisory)');
    console.log('══════════════════════════════════════════════════════\n');
    console.log(text);
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  End of advisory report. No build gate applied.');
    console.log('══════════════════════════════════════════════════════\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Non-blocking: log the error but exit 0 so CI continues.
    console.warn(`[detect-dupes] Advisory review unavailable (${message}). Skipping.`);
    process.exit(0);
  }
}

async function main(): Promise<void> {
  await detectNearDuplicates(RAW_OBSERVED_LABELS);
  // Exit 0 unconditionally — this step is advisory, never blocking.
  process.exit(0);
}

main().catch(() => process.exit(0));
