# Mathematics Application QA Audit Report

Date: 2026-03-01  
Last updated: 2026-03-01

Scope: repository-wide static QA review focused on mathematical logic correctness, UI/UX robustness, and general stability.

## Executive Summary

This audit originally reported:

- **CRITICAL:** 2
- **MEDIUM:** 4
- **LOW:** 4

After follow-up fixes, the current status is:

- **Resolved:** C1, C2, M1, M2, M3, M4, L1, L2, L3, L4
- **Partially addressed:** none
- **Open:** none

> Notes:
> - “Partially addressed” means code-level mitigation exists, but behavior should still be validated with broader UX/device testing.
> - Automated verification remains environment-dependent due to package registry access constraints in some environments.

---

## Findings and Current Status

| ID | Severity | Finding | Status |
|---|---|---|---|
| C1 | CRITICAL | Numeric validator accepted malformed numeric strings | ✅ Resolved |
| C2 | CRITICAL | Random function selector could return `undefined` | ✅ Resolved |
| M1 | MEDIUM | Domain builder allowed contradictory interval construction | ✅ Resolved |
| M2 | MEDIUM | Function graph had division-by-zero scaling edge case | ✅ Resolved |
| M3 | MEDIUM | `absolute` function type missing in generator dispatch | ✅ Resolved |
| M4 | MEDIUM | Duplicated domain normalization logic | ✅ Resolved |
| L1 | LOW | Dead/unused derivative helper path | ✅ Resolved |
| L2 | LOW | Distractor generation can produce awkward expressions | ✅ Resolved |
| L3 | LOW | `as any` type escapes in icon props | ✅ Resolved |
| L4 | LOW | Small-screen layout ergonomics risks | ✅ Resolved |

---

## Detailed Findings

### C1. Numeric validator accepted malformed numeric strings
**Domain:** Mathematical Logic  
**Status:** ✅ Resolved

**Original risk:** inputs like `"2abc"` were accepted as numeric matches due to permissive parsing.

**Mitigation implemented:** strict full-string numeric parsing with explicit finite-number check.

**Residual risk:** still depends on string normalization behavior for locale-specific separators (future enhancement).

---

### C2. Random function selector crash risk with empty filtered set
**Domain:** General Bugs / Stability  
**Status:** ✅ Resolved

**Original risk:** empty filter path could return `undefined` and crash downstream consumers.

**Mitigation implemented:** fallback to full function collection when filter result is empty.

**Residual risk:** fallback hides misconfiguration; optional telemetry/logging could improve observability.

---

### M1. Domain builder contradictory intervals
**Domain:** Mathematical Logic / UI UX  
**Status:** ✅ Resolved

**Original risk:** contradictory domain combinations could be emitted (invalid/empty intervals).

**Mitigation implemented:** enhanced selection sanitization now enforces valid bound pairings, prevents empty singleton-open intervals around zero, and keeps strict-sign bounds open by definition. Shared normalization/comparison is still used for grading consistency.

---

### M2. Graph scaling divide-by-zero
**Domain:** Mathematical Logic / UI Rendering  
**Status:** ✅ Resolved

**Original risk:** zero-length domain/range could produce `NaN/Infinity` coordinates.

**Mitigation implemented:** guarded spans (`safeXSpan`, `safeYSpan`) with non-zero fallback.

---

### M3. Missing `absolute` dispatch
**Domain:** General Bugs / Feature correctness  
**Status:** ✅ Resolved

**Original risk:** explicit `absolute` requests could silently fallback to another generator.

**Mitigation implemented:** dispatch map now includes `absolute` generator route.

---

### M4. Duplicated domain normalization logic
**Domain:** General Bugs / Maintainability  
**Status:** ✅ Resolved

**Original risk:** divergent normalization behavior across features.

**Mitigation implemented:** extracted shared utility (`domainUtils`) and reused it across call sites, plus unit coverage.

---

### L1. Unused derivative helper path
**Domain:** General Code Quality  
**Status:** ✅ Resolved

**Original risk:** stale code path increased maintenance burden and confusion.

**Mitigation implemented:** removed obsolete helper/plumbing from active module logic.

---

### L2. String-based distractor mutation quality issues
**Domain:** UI/UX / Content Quality  
**Status:** ✅ Resolved

**Risk addressed:** previous raw concatenation/replacement artifacts could produce low-quality distractors.

**Mitigation implemented:** derivative and integral generators now use rule-aware distractor templates and structured transforms (sign inversion, scalar variation, constant-term handling), reducing malformed/awkward outputs while preserving pedagogical plausibility.

---

### L3. `as any` icon type escapes
**Domain:** General Code Quality  
**Status:** ✅ Resolved

**Original risk:** reduced type safety and missed compile-time checks.

**Mitigation implemented:** switched to typed icon names using component prop typings.

---

### L4. Small-screen ergonomics
**Domain:** UI/UX  
**Status:** ✅ Resolved

**Original risk:** fixed dimensions and spacing could degrade on narrow devices.

**Mitigation implemented:** Training Hub now applies compact-mode layout for narrow screens, including single-column flow, dynamic card width computation, and compact typography/padding adjustments to preserve readability and touch targets.

---

## Verification and Testing Notes

### What was verified
1. Repository-level static scan and targeted file inspection.
2. Code-level checks for each fixed finding (critical-first priority).
3. Added/updated unit tests for:
   - malformed numeric string rejection,
   - domain normalization/equivalence behavior.

### Environment constraints
In restricted environments, dependency installation and test execution can fail due to npm registry access policies. If this occurs, run verification in CI or a network-enabled local environment:

```bash
npm install
npm test -- --runInBand
```

---

## Recommended Next Actions

1. **Finish M1**: implement complete interval validity rules with user-facing explanation states.
2. Add regression tests covering domain-builder invalid-combination UX behavior and distractor quality constraints.
3. Keep periodic screenshot/snapshot checks for small devices and landscape mode in CI/manual QA.

