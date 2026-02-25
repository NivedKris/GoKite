// ─────────────────────────────────────────────────────────────────────────────
// Shared filter persistence via sessionStorage
// Both B2C (FilterBar) and B2B (B2BFilterBar) read/write the same key so
// filter selections survive navigation between /b2c and /b2b.
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_KEY = 'dashboard_filters';
const COMPANIES_KEY = 'dashboard_companies';

/**
 * Read persisted filter state.
 * Returns null if nothing is stored yet.
 * @returns {{ month: string, companyIds: number[] } | null}
 */
export function getFilterState() {
    try {
        const raw = sessionStorage.getItem(FILTER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Persist filter state.
 * @param {{ month: string, companyIds: number[] }} state
 */
export function saveFilterState(state) {
    try {
        sessionStorage.setItem(FILTER_KEY, JSON.stringify(state));
    } catch {
        // sessionStorage unavailable (e.g. private browsing with strict settings) — ignore
    }
}

/**
 * Persist the full companies list (id + name) so export handlers can resolve names.
 * @param {{ id: number, name: string }[]} companies
 */
export function saveCompanies(companies) {
    try {
        sessionStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    } catch {
        // ignore
    }
}

/**
 * Given a list of selected company IDs, return a comma-separated string of
 * their names (looked up from the persisted companies list).
 * Falls back to the raw IDs if names are not available.
 * @param {number[]} companyIds
 * @returns {string}
 */
export function resolveCompanyNames(companyIds) {
    try {
        const raw = sessionStorage.getItem(COMPANIES_KEY);
        if (!raw) return companyIds.join(', ');
        const companies = JSON.parse(raw);
        const idSet = new Set(companyIds.map(Number));
        const names = companies
            .filter((c) => idSet.has(Number(c.id)))
            .map((c) => c.name);
        return names.length ? names.join(', ') : companyIds.join(', ');
    } catch {
        return companyIds.join(', ');
    }
}
