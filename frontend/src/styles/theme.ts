export const colors = {
    // ── Brand / Primary ──
    primary:        "#10b981",   // emerald-500
    primaryHover:   "#059669",   // emerald-600
    primaryActive:  "#047857",   // emerald-700
    primaryLight:   "#d1fae5",   // emerald-100
    primaryLighter: "#ecfdf5",   // emerald-50
    primaryDark:    "#065f46",   // emerald-800

    // ── Text ──
    textPrimary:    "#111827",   // gray-900
    textSecondary:  "#475569",   // slate-600
    textMuted:      "#64748b",   // slate-500
    textHint:       "#94a3b8",   // slate-400

    // ── Surfaces ──
    surface:        "#ffffff",
    surfaceHover:   "#f8fafc",   // slate-50
    surfaceAlt:     "#f1f5f9",   // slate-100
    surfaceAltHover:"#e2e8f0",   // slate-200
    background:     "#f8fafc",   // page bg
    backgroundGreen:"#f0fdf4",   // green-tinted page bg

    // ── Borders ──
    border:         "#e5e7eb",   // gray-200
    borderLight:    "#f1f5f9",   // slate-100
    borderGreen:    "#d1fae5",   // emerald-100
    borderGreenLight:"#bbf7d0",  // emerald-200

    // ── Danger ──
    danger:         "#b91c1c",
    dangerBg:       "#fee2e2",
    dangerBgHover:  "#fecaca",

    // ── Info / Blue ──
    info:           "#1d4ed8",
    infoBg:         "#eff6ff",
    infoBgHover:    "#dbeafe",

    // ── Warning / Amber ──
    warning:        "#c2410c",
    warningBg:      "#fff7ed",

    // ── Success (same as primary for this brand) ──
    success:        "#15803d",
    successBg:      "#dcfce7",

    // ── Level badge colors ──
    levels: {
        ENTRY:   { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" },
        Entry:   { bg: "#ecfeff", border: "#a5f3fc", text: "#0f766e" },
        STARTER: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
        Starter: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
        MEDIUM:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
        Medium:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
        MASTER:  { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
        Master:  { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
        EXPERT:  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
        Expert:  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
        STELLAR: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
        Stellar: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
    } as Record<string, { bg: string; border: string; text: string }>,

    // ── Status badge colors ──
    status: {
        Upcoming: { bg: "#dcfce7", text: "#047857" },
        Ongoing:  { bg: "#ecfdf5", text: "#059669" },
        Finished: { bg: "#f1f5f9", text: "#64748b" },
    } as Record<string, { bg: string; text: string }>,
};

export const spacing = {
    xxs: "0.25rem",    // 4px
    xs:  "0.5rem",     // 8px
    sm:  "0.75rem",    // 12px
    md:  "1rem",       // 16px
    lg:  "1.5rem",     // 24px
    xl:  "2rem",       // 32px
    xxl: "3rem",       // 48px
};

export const fontSize = {
    xs:   "0.78rem",   // 12.5px — badges, captions
    sm:   "0.88rem",   // 14px  — small UI text
    base: "0.95rem",   // 15.2px — body
    md:   "1.05rem",   // 16.8px — emphasized body
    lg:   "1.15rem",   // 18.4px — card titles
    xl:   "1.5rem",    // 24px  — section headings
    "2xl":"2rem",      // 32px  — page titles
};

export const fontWeight = {
    regular: 400,
    medium:  500,
    semibold:600,
    bold:    700,
    black:   800,
};

export const radius = {
    sm:   "0.5rem",    // 8px  — inputs, small chips
    md:   "0.75rem",   // 12px — inner elements
    lg:   "1rem",      // 16px — cards, modals
    xl:   "1.25rem",   // 20px — large cards
    pill: "999px",     // fully rounded
};

export const shadow = {
    xs:  "0 1px 2px rgba(15, 23, 42, 0.04)",
    sm:  "0 1px 4px rgba(15, 23, 42, 0.06)",
    md:  "0 4px 16px rgba(15, 23, 42, 0.08)",
    lg:  "0 8px 24px rgba(15, 23, 42, 0.10)",
    xl:  "0 12px 32px rgba(15, 23, 42, 0.12)",
    green: "0 8px 24px rgba(5, 150, 105, 0.12)",
};

export const transition = {
    fast:    "0.15s ease",
    normal:  "0.2s ease",
    smooth:  "0.3s ease",
    spring:  "0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
};

export const breakpoints = {
    sm: "40rem",    // 640px  — mobile
    md: "48rem",    // 768px  — tablet
    lg: "64rem",    // 1024px — small desktop
    xl: "80rem",    // 1280px — large desktop
};

export const zIndex = {
    dropdown: 100,
    sticky:   200,
    navbar:   1000,
    modal:    1100,
    toast:    1200,
};

// ── Navbar dimensions ──
export const navbar = {
    height: "4.25rem",
    mobileHeight: "3.75rem",
};

// ── Max widths ──
export const maxWidth = {
    narrow: "42rem",    // feed, single-column content
    content:"72rem",    // standard pages
    wide:   "80rem",    // leaderboard, admin
    full:   "92rem",    // layout shell
};