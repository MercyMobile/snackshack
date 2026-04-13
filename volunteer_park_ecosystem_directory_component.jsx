// ---- Browser-compatible Volunteer Park Ecosystem Directory ----
// No imports needed as React is provided via CDN

(function() {
    const { useEffect, useMemo, useState } = React;

    // ---- Data model ----
    const CATEGORIES = [
        "Food & Drink",
        "Health & Wellness",
        "Retail",
        "Nonprofit / Community",
        "Other",
    ];

    // ---- Seed data ----
    const DIRECTORY = [
        {
            id: "home-country-store",
            name: "Home Country Store",
            category: "Retail",
            isBusiness: true,
            tags: ["Grocery", "Convenience", "Local staple"],
            tie: {
                hasTie: true,
                type: "Nearby",
                notes: "Nearby business within ~5 miles of Volunteer Park.",
            },
            address: "1309 Key Peninsula Hwy N, Lakebay, WA 98349",
            approxCoords: { lat: 47.26925, lng: -122.7685 },
            distanceMiles: 2.85,
            activity: {
                isActive: true,
                evidence: "Recent customer reviews within the last 90 days (per research summary)",
                window: "≤ 90 days",
            },
            confidence: "High",
            phone: "(253) 884-2106",
            mapsQuery: "Home Country Store 1309 Key Peninsula Hwy N Lakebay WA 98349",
        },
        {
            id: "madrona-cafe",
            name: "Madrona Cafe",
            category: "Food & Drink",
            isBusiness: true,
            tags: ["Cafe", "Coffee", "Breakfast"],
            tie: {
                hasTie: true,
                type: "Nearby",
                notes: "Nearby business within ~5 miles of Volunteer Park.",
            },
            address: "15607 Olson Dr NW, Lakebay, WA 98349",
            approxCoords: { lat: 47.3409, lng: -122.746 },
            distanceMiles: 2.21,
            activity: {
                isActive: true,
                evidence: "Listing showed an update within the last 90 days (per research summary)",
                window: "≤ 90 days",
            },
            confidence: "Medium",
            phone: "(503) 706-0983",
            mapsQuery: "Madrona Cafe 15607 Olson Dr NW Lakebay WA 98349",
        },
        {
            id: "key-center-chiropractic",
            name: "Key Center Chiropractic",
            category: "Health & Wellness",
            isBusiness: true,
            tags: ["Chiropractic", "Wellness", "Local care"],
            tie: {
                hasTie: true,
                type: "Nearby",
                notes: "Nearby business within ~5 miles of Volunteer Park.",
            },
            address: "9013 Key Peninsula Hwy NW, Lakebay, WA 98349",
            approxCoords: { lat: 47.33921, lng: -122.74566 },
            distanceMiles: 2.10,
            activity: {
                isActive: true,
                evidence: "First-party website appears maintained and current (per research summary)",
                window: "≤ 90 days",
            },
            confidence: "High",
            phone: "(253) 884-3040",
            website: "https://keycenterwellness.com/",
            mapsQuery: "Key Center Chiropractic 9013 Key Peninsula Hwy NW Lakebay WA 98349",
        },
        {
            id: "2-margaritas",
            name: "2 Margaritas",
            category: "Food & Drink",
            isBusiness: true,
            tags: ["Mexican", "Dinner", "Family"],
            tie: {
                hasTie: true,
                type: "Nearby",
                notes:
                    "Nearby business within ~5 miles; location coordinate in summary was approximate, so treat distance as approximate.",
            },
            address: "1509 Key Peninsula Hwy NW, Lakebay, WA 98349",
            distanceMiles: 3.55,
            activity: {
                isActive: true,
                evidence: "Listing showed an update within the last 90 days (per research summary)",
                window: "≤ 90 days",
            },
            confidence: "Medium",
            phone: "(253) 303-4100",
            website: "https://2margaritas.com/",
            mapsQuery: "2 Margaritas 1509 Key Peninsula Hwy NW Lakebay WA 98349",
        },
        {
            id: "kp-healthy-community",
            name: "Key Peninsula Partnership for a Healthy Community",
            category: "Nonprofit / Community",
            isBusiness: false,
            tags: ["Community", "Programs", "Sponsorship"],
            tie: {
                hasTie: true,
                type: "Sponsor/Partner",
                notes:
                    "Sponsors/partners in local activities that route participants to the Volunteer Park admin office.",
            },
            activity: {
                isActive: true,
                evidence: "Organization publishes periodic community updates",
                window: "Varies",
            },
            confidence: "High",
            website: "https://kphealthycommunity.org/",
            mapsQuery: "Key Peninsula Partnership for a Healthy Community",
        },
        {
            id: "greater-tacoma-community-foundation",
            name: "Greater Tacoma Community Foundation",
            category: "Nonprofit / Community",
            isBusiness: false,
            tags: ["Grantmaking", "Community"],
            tie: {
                hasTie: true,
                type: "Grant Pathway",
                notes:
                    "Grant pathway referenced for Volunteer Park public Wi‑Fi funding in district materials.",
            },
            activity: { isActive: true, evidence: "Ongoing foundation operations", window: "N/A" },
            confidence: "High",
            website: "https://www.gtcf.org/",
            mapsQuery: "Greater Tacoma Community Foundation",
        },
    ];

    // ---- Small helpers ----
    function mapsLink(query) {
        if (!query) return null;
        const q = encodeURIComponent(query);
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }

    function normalize(s) {
        return s.toLowerCase().trim();
    }

    function clsx(...parts) {
        return parts.filter(Boolean).join(" ");
    }

    // ---- Component ----
    function VolunteerParkDirectory() {
        const [query] = useState("");
        const [category] = useState("All");
        const [onlyTied] = useState(false);
        const [onlyActive] = useState(true);
        const [sortBy] = useState("distance");
        const [showOrgs] = useState(true);

        const [favorites, setFavorites] = useState({});

        // Favorites persistence
        useEffect(() => {
            try {
                const raw = localStorage.getItem("vp_directory_favorites_v1");
                if (raw) setFavorites(JSON.parse(raw));
            } catch (e) { }
        }, []);
        useEffect(() => {
            try {
                localStorage.setItem("vp_directory_favorites_v1", JSON.stringify(favorites));
            } catch (e) { }
        }, [favorites]);

        const results = useMemo(() => {
            const q = normalize(query);

            let items = DIRECTORY.filter((b) => {
                if (!showOrgs && !b.isBusiness) return false;
                if (onlyTied && !b.tie.hasTie) return false;
                if (onlyActive && !b.activity.isActive) return false;
                if (category !== "All" && b.category !== category) return false;
                if (!q) return true;

                const hay = [
                    b.name,
                    b.category,
                    b.address ?? "",
                    b.tags.join(" "),
                    b.tie.type ?? "",
                    b.tie.notes ?? "",
                ]
                    .join(" ")
                    .toLowerCase();

                return hay.includes(q);
            });

            items.sort((a, b) => {
                if (sortBy === "name") return a.name.localeCompare(b.name);

                const da = a.distanceMiles ?? Number.POSITIVE_INFINITY;
                const db = b.distanceMiles ?? Number.POSITIVE_INFINITY;
                if (da !== db) return da - db;
                return a.name.localeCompare(b.name);
            });

            // Favorites bubble to top
            items = items.sort((a, b) => {
                const fa = favorites[a.id] ? 1 : 0;
                const fb = favorites[b.id] ? 1 : 0;
                return fb - fa;
            });

            return items;
        }, [query, category, onlyTied, onlyActive, sortBy, showOrgs, favorites]);

        const counts = useMemo(() => {
            const total = DIRECTORY.filter((b) => (showOrgs ? true : b.isBusiness)).length;
            const active = DIRECTORY.filter((b) => (showOrgs ? true : b.isBusiness)).filter(
                (b) => b.activity.isActive
            ).length;
            return { total, active };
        }, [showOrgs]);

        return (
            <section className="w-full bg-[#FDFBF7]">
                <div className="mx-auto max-w-6xl px-4 py-8">
                    {/* Results */}
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {results.map((b) => (
                            <BusinessCard
                                key={b.id}
                                b={b}
                                favorite={!!favorites[b.id]}
                                onToggleFavorite={() =>
                                    setFavorites((prev) => ({ ...prev, [b.id]: !prev[b.id] }))
                                }
                            />
                        ))}
                    </div>

                    {results.length === 0 ? (
                        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#A5ACAF] bg-[#A5ACAF]/5 p-8 text-center text-[#002244] font-bold">
                            No matches found in the ecosystem.
                        </div>
                    ) : null}

                    {/* Footer note */}
                    <footer className="mt-12 border-t-2 border-[#69BE28] pt-6 text-[10px] font-bold uppercase tracking-widest text-[#A5ACAF] text-center">
                        <div className="mb-4">
                            <a 
                                href="mailto:rachel@snackshack-volunteerpark.com?subject=Add my business to the Ecosystem Directory&body=Business Name:%0AAddress:%0APhone:%0AWebsite:%0ADetails:" 
                                className="inline-block rounded-lg border-2 border-[#002244] bg-white px-4 py-2 text-[11px] font-black text-[#002244] transition-all hover:bg-[#002244] hover:text-[#69BE28]"
                            >
                                ★ Add your Lakebay business here
                            </a>
                        </div>
                        <p>
                            Promoting local neighbors & services around Volunteer Park. 
                            Information subject to change. Go Hawks! Go Shack!
                        </p>
                    </footer>
                </div>
            </section>
        );
    }

    function Toggle({ label, value, onChange, hint }) {
        return (
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={clsx(
                        "relative h-6 w-11 rounded-full border-2 transition-all duration-300",
                        value ? "border-[#002244] bg-[#69BE28]" : "border-[#A5ACAF] bg-white"
                    )}
                    aria-pressed={value}
                    aria-label={label}
                >
                    <span
                        className={clsx(
                            "absolute top-0.5 h-4 w-4 rounded-full shadow-md transition-all duration-300",
                            value ? "left-5 bg-[#002244]" : "left-0.5 bg-[#A5ACAF]"
                        )}
                    />
                </button>
                <div>
                    <div className="text-xs font-bold text-[#002244] tracking-tight">{label}</div>
                    {hint ? <div className="text-[10px] text-[#A5ACAF] font-bold uppercase">{hint}</div> : null}
                </div>
            </div>
        );
    }

    function BusinessCard({ b, favorite, onToggleFavorite }) {
        const maps = mapsLink(b.mapsQuery || b.address || b.name);

        return (
            <article className="group relative overflow-hidden rounded-2xl border-2 border-[#A5ACAF]/30 bg-white p-5 shadow-md transition-all hover:border-[#69BE28] hover:shadow-xl">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-bold text-[#002244]" style={{ fontFamily: "'Playfair Display', serif" }}>{b.name}</h3>
                            {b.activity.isActive ? (
                                <span className="rounded-full bg-[#69BE28] px-2 py-0.5 text-[10px] font-black text-[#002244] uppercase">
                                    Active
                                </span>
                            ) : (
                                <span className="rounded-full bg-[#A5ACAF] px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                    Pending
                                </span>
                            )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#69BE28]">{b.category}</span>
                            <span className="text-xs text-[#A5ACAF]">•</span>
                            {typeof b.distanceMiles === "number" ? (
                                <span className="text-[10px] font-bold text-[#002244]">{b.distanceMiles.toFixed(2)} miles</span>
                            ) : null}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onToggleFavorite}
                        className={clsx(
                            "shrink-0 rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase transition-all",
                            favorite
                                ? "border-[#69BE28] bg-[#69BE28] text-[#002244]"
                                : "border-[#A5ACAF] bg-white text-[#A5ACAF] hover:border-[#002244] hover:text-[#002244]"
                        )}
                        aria-pressed={favorite}
                    >
                        {favorite ? "★ Saved" : "☆ Save"}
                    </button>
                </div>

                {b.address ? <p className="mt-4 text-sm font-medium text-[#002244]/70">{b.address}</p> : null}

                {b.tie.hasTie ? (
                    <div className="mt-4 rounded-xl border-l-4 border-[#69BE28] bg-[#002244]/5 p-3">
                        <div className="text-[10px] font-black text-[#002244] uppercase tracking-widest">Community Tie</div>
                        <div className="mt-1 text-xs text-[#002244]/80 italic">
                            {b.tie.notes}
                        </div>
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                    {b.phone ? (
                        <a
                            className="rounded-lg border-2 border-[#002244] bg-white px-3 py-2 text-[10px] font-black uppercase text-[#002244] transition-all hover:bg-[#002244] hover:text-[#69BE28]"
                            href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`}
                        >
                            Call
                        </a>
                    ) : null}

                    {b.website ? (
                        <a
                            className="rounded-lg border-2 border-[#002244] bg-white px-3 py-2 text-[10px] font-black uppercase text-[#002244] transition-all hover:bg-[#002244] hover:text-[#69BE28]"
                            href={b.website}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Site
                        </a>
                    ) : null}

                    {maps ? (
                        <a
                            className="rounded-lg border-2 border-[#002244] bg-white px-3 py-2 text-[10px] font-black uppercase text-[#002244] transition-all hover:bg-[#002244] hover:text-[#69BE28]"
                            href={maps}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Map
                        </a>
                    ) : null}
                </div>
            </article>
        );
    }

    // Assign to window for global access
    window.VolunteerParkDirectory = VolunteerParkDirectory;
})();