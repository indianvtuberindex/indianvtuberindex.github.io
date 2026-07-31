/*
  DeshVTuber Hub — main.js
  ------------------------
  Table of contents:
    1. NAVIGATION
    2. SEARCH
    3. FILTERS
    4. DATA
    5. RENDERING
    6. MODALS
    7. ANIMATIONS
    8. UTILITIES
    9. INIT
*/

(function () {
  "use strict";

  /*==================== UTILITIES ====================*/
  // Small DOM helpers so the rest of the file stays readable.
  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  /** Turn "Ananya Rao" into "AR" for placeholder portraits/logos. */
  function getInitials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  /** Build a two-tone CSS gradient string from a talent/agency's palette. */
  function gradientFrom(color1, color2) {
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  }

  /** Format an ISO date ("2026-09-14") into "14 Sep 2026". */
  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatDayMonth(iso) {
    const d = new Date(iso + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-IN", { day: "2-digit" }),
      mon: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  }

  /** Escape user-typed search text before using it in comparisons/regex. */
  function normalize(str) {
    return (str || "").toString().trim().toLowerCase();
  }

  /*==================== DATA ====================*/
  // Everything below is fictional sample data for demonstration.
  // To add a new VTuber: append ONE object to TALENTS — cards, the search
  // index, filters and the featured carousel all update automatically.
  // Real portraits/logos can be added later by dropping files into
  // assets/img/ and swapping the placeholder render in renderPortrait().

  const SITE_STATS = {
    talents: 12,
    agencies: 4,
    projects: 9,
    communityK: 38, // shown as "38K+"
  };

  const AGENCIES = [
    {
      id: "starlace",
      name: "Starlace Studio",
      shortName: "Starlace",
      color1: "#a855f7",
      color2: "#6366f1",
      website: "#",
      description:
        "A multi-generation agency built around variety streaming, music covers and story-driven debuts. Known for tightly produced 3D concerts.",
      socials: { x: "#", youtube: "#", discord: "#" },
    },
    {
      id: "neonveda",
      name: "NeonVeda",
      shortName: "NeonVeda",
      color1: "#38bdf8",
      color2: "#22d3ee",
      website: "#",
      description:
        "A gaming-first collective focused on competitive titles, co-op chaos and long-form horror playthroughs.",
      socials: { x: "#", youtube: "#", discord: "#" },
    },
    {
      id: "lotusframe",
      name: "Lotusframe Talents",
      shortName: "Lotusframe",
      color1: "#f472b6",
      color2: "#a855f7",
      website: "#",
      description:
        "Art, ASMR and slow-living streams. Lotusframe talents lean into cozy, high-production 2D rigs and painterly worldbuilding.",
      socials: { x: "#", youtube: "#", discord: "#" },
    },
    {
      id: "indie",
      name: "Independent",
      shortName: "Indie",
      color1: "#9089b0",
      color2: "#675e87",
      website: "#",
      description:
        "Solo creators managing their own brand, schedule and commissions — no agency contract attached.",
      socials: {},
    },
  ];

  const TALENTS = [
    {
      id: "aria-vantara",
      name: "Aria Vantara",
      fanName: "Vantarians",
      oshiMark: "✦",
      agencyId: "starlace",
      generation: "Gen 2",
      gender: "Female",
      debut: "2023-03-12",
      birthday: "05-14",
      height: "158 cm",
      languages: ["Hindi", "English"],
      platforms: ["YouTube", "Instagram"],
      contentType: ["Singing", "Variety"],
      tags: ["VSinger", "Gen 2", "Hindi"],
      tier: "Headliner",
      color1: "#a855f7",
      color2: "#6366f1",
      illustrator: "@inkbyroshni",
      live2dArtist: "Studio Kaze",
      shortDesc: "A wandering star-singer collecting melodies from every city she streams from.",
      bio: "Aria Vantara is a celestial wanderer said to have fallen from a constellation that no longer exists. She streams a mix of original songs, karaoke nights and city-hopping variety content, chasing new melodies wherever her map leads next.",
      lore: "Exiled from the Vantara star-cluster for singing forbidden harmonies, Aria now roams the mortal plane recording every song she hears — hoping one of them will sing her way home.",
      socials: { youtube: "#", x: "#", instagram: "#", discord: "#" },
    },
    {
      id: "kavi-nox",
      name: "Kavi Nox",
      fanName: "Noxlings",
      oshiMark: "☾",
      agencyId: "starlace",
      generation: "Gen 1",
      gender: "Male",
      debut: "2022-08-02",
      birthday: "11-30",
      height: "176 cm",
      languages: ["English", "Hindi", "Marathi"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Storytelling", "Variety"],
      tags: ["Storyteller", "Gen 1", "Multilingual"],
      tier: "Icon",
      color1: "#6366f1",
      color2: "#38bdf8",
      illustrator: "@penandpixel",
      live2dArtist: "Studio Kaze",
      shortDesc: "A midnight librarian who narrates folklore no one else remembers.",
      bio: "Kavi Nox keeps a library that exists only after midnight, filled with stories that vanish by morning. He streams long-form narration, folklore deep-dives and the occasional co-op horror run when the library gets 'too quiet.'",
      lore: "Kavi inherited the Nox Archive from a predecessor who disappeared mid-chapter. He's been trying to finish that last story ever since.",
      socials: { youtube: "#", x: "#", twitch: "#", discord: "#" },
    },
    {
      id: "myra-ember",
      name: "Myra Ember",
      fanName: "Emberfolk",
      oshiMark: "🔥",
      agencyId: "neonveda",
      generation: "Gen 3",
      gender: "Female",
      debut: "2024-01-20",
      birthday: "07-09",
      height: "162 cm",
      languages: ["Hindi", "English", "Bengali"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Gaming", "Variety"],
      tags: ["FPS", "Gen 3", "Bengali"],
      tier: "Rising Star",
      color1: "#fb7185",
      color2: "#f472b6",
      illustrator: "@doodlebynilu",
      live2dArtist: "Rigwork Collective",
      shortDesc: "A competitive FPS ace with a habit of narrating her own highlight reels live.",
      bio: "Myra Ember was forged (her words) in the finals of a regional tournament and hasn't stopped talking about it since. Expect ranked grinds, chaotic co-op nights and a scoreboard she checks more than her chat.",
      lore: "Myra claims she was 'summoned' the moment a losing team rage-quit a lobby. No one has been able to disprove this.",
      socials: { youtube: "#", x: "#", twitch: "#" },
    },
    {
      id: "devansh-riot",
      name: "Devansh Riot",
      fanName: "Riotcrew",
      oshiMark: "⚡",
      agencyId: "neonveda",
      generation: "Gen 2",
      gender: "Male",
      debut: "2023-06-18",
      birthday: "02-27",
      height: "180 cm",
      languages: ["Hindi", "Punjabi", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Gaming", "Podcast"],
      tags: ["Gaming", "Gen 2", "Punjabi"],
      tier: "Headliner",
      color1: "#38bdf8",
      color2: "#22d3ee",
      illustrator: "@rioukun",
      live2dArtist: "Rigwork Collective",
      shortDesc: "Loud opinions, louder plays — a full-time gamer and part-time podcaster.",
      bio: "Devansh Riot runs the loudest lobby on the server and a surprisingly thoughtful weekly podcast in between matches. He's known for adopting whatever game his chat is currently obsessed with.",
      lore: "Legend says Devansh was banned from a tournament bracket for winning 'too enthusiastically.' He wears it as a badge of honour.",
      socials: { youtube: "#", x: "#", twitch: "#", discord: "#" },
    },
    {
      id: "sana-willow",
      name: "Sana Willow",
      fanName: "Willowkin",
      oshiMark: "🌿",
      agencyId: "lotusframe",
      generation: "Gen 1",
      gender: "Female",
      debut: "2022-04-05",
      birthday: "09-21",
      height: "155 cm",
      languages: ["English", "Hindi", "Tamil"],
      platforms: ["YouTube", "Instagram"],
      contentType: ["ASMR", "Art"],
      tags: ["ASMR", "Gen 1", "Tamil"],
      tier: "Headliner",
      color1: "#34d399",
      color2: "#38bdf8",
      illustrator: "@willowpetal",
      live2dArtist: "Studio Kaze",
      shortDesc: "A forest keeper who paints and whispers her way through cozy weekday streams.",
      bio: "Sana Willow tends a stream-forest that grows a little each broadcast. Her content mixes slow art streams, whispered lore readings and the occasional plant-care rant.",
      lore: "Sana grew from a seed planted during a thunderstorm; she still gets a little static-y whenever it rains during a stream.",
      socials: { youtube: "#", instagram: "#", discord: "#" },
    },
    {
      id: "rhea-monsoon",
      name: "Rhea Monsoon",
      fanName: "Monsooners",
      oshiMark: "☂",
      agencyId: "lotusframe",
      generation: "Gen 2",
      gender: "Female",
      debut: "2023-07-01",
      birthday: "06-15",
      height: "160 cm",
      languages: ["Hindi", "English", "Malayalam"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Singing", "Talk"],
      tags: ["VSinger", "Gen 2", "Malayalam"],
      tier: "Rising Star",
      color1: "#38bdf8",
      color2: "#6366f1",
      illustrator: "@rainkissed",
      live2dArtist: "Rigwork Collective",
      shortDesc: "A rain-born vocalist whose streams always seem to sync with the weather.",
      bio: "Rhea Monsoon sings best when it's raining — which, suspiciously, is most of the time she's live. Weekly acoustic sessions, chatty just-talking streams and the odd rooftop-themed set.",
      lore: "Rhea insists she can 'summon' light drizzle mid-song. Meteorologists remain unconvinced; her chat remains delighted.",
      socials: { youtube: "#", x: "#", twitch: "#" },
    },
    {
      id: "kian-pixel",
      name: "Kian Pixel",
      fanName: "Pixelheads",
      oshiMark: "🎮",
      agencyId: "indie",
      generation: "Indie",
      gender: "Male",
      debut: "2021-11-11",
      birthday: "03-03",
      height: "172 cm",
      languages: ["English", "Hindi"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Gaming", "Retro"],
      tags: ["Retro", "Indie", "Gaming"],
      tier: "Headliner",
      color1: "#f97316",
      color2: "#f472b6",
      illustrator: "@8bitdrawn",
      live2dArtist: "Self-rigged",
      shortDesc: "A pixel-sprite brought to life, obsessed with clearing every retro game backlog.",
      bio: "Kian Pixel glitched out of an old cartridge and has been trying to 'finish the game' ever since — one retro playthrough, speedrun attempt and modded save file at a time.",
      lore: "Kian remembers nothing before the console screen flickered. He collects old game manuals hoping one mentions his name.",
      socials: { youtube: "#", twitch: "#", discord: "#" },
    },
    {
      id: "isha-verdant",
      name: "Isha Verdant",
      fanName: "Verdants",
      oshiMark: "🍃",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2024-05-30",
      birthday: "12-08",
      height: "159 cm",
      languages: ["Hindi", "English", "Gujarati"],
      platforms: ["Instagram", "YouTube"],
      contentType: ["Art", "Talk"],
      tags: ["Art", "Indie", "Gujarati"],
      tier: "Rookie",
      color1: "#34d399",
      color2: "#a3e635",
      illustrator: "@vinehand",
      live2dArtist: "Self-rigged",
      shortDesc: "A sketchbook spirit who streams half-finished art and fully-formed opinions.",
      bio: "Isha Verdant draws whatever her chat argues about the loudest, then narrates the process in painfully honest detail. New to streaming, already fluent in chaos.",
      lore: "Isha claims her sketchbook is 'alive' and occasionally redraws her linework overnight. She has not slept well since.",
      socials: { instagram: "#", youtube: "#" },
    },
    {
      id: "tanish-orbit",
      name: "Tanish Orbit",
      fanName: "Orbiters",
      oshiMark: "🪐",
      agencyId: "starlace",
      generation: "Gen 3",
      gender: "Male",
      debut: "2024-02-14",
      birthday: "10-19",
      height: "174 cm",
      languages: ["Hindi", "English", "Telugu"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Variety", "Talk"],
      tags: ["Variety", "Gen 3", "Telugu"],
      tier: "Rising Star",
      color1: "#a855f7",
      color2: "#38bdf8",
      illustrator: "@cosmicnib",
      live2dArtist: "Studio Kaze",
      shortDesc: "A satellite that fell in love with Earth and never left orbit.",
      bio: "Tanish Orbit was meant to just pass by — instead he got hooked on chai, cricket commentary and late-night just-chatting streams, and decided to stay.",
      lore: "Tanish still receives the occasional 'return to orbit' transmission during streams, which he reads out loud and politely ignores.",
      socials: { youtube: "#", twitch: "#", x: "#" },
    },
    {
      id: "naina-frostveil",
      name: "Naina Frostveil",
      fanName: "Frostkin",
      oshiMark: "❄",
      agencyId: "neonveda",
      generation: "Gen 1",
      gender: "Female",
      debut: "2022-01-08",
      birthday: "01-30",
      height: "163 cm",
      languages: ["Hindi", "English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Gaming", "Horror"],
      tags: ["Horror", "Gen 1", "Gaming"],
      tier: "Icon",
      color1: "#7dd3fc",
      color2: "#a855f7",
      illustrator: "@frostlined",
      live2dArtist: "Rigwork Collective",
      shortDesc: "An unbothered horror-game veteran who scares chat more than the games do.",
      bio: "Naina Frostveil has cleared more horror game backlogs than she can count and still hasn't jumped once. Her calm, deadpan commentary during the scariest moments has become a running joke in her community.",
      lore: "Rumour has it Naina was carved from an old winter myth and simply doesn't register fear the way others do.",
      socials: { youtube: "#", twitch: "#", discord: "#" },
    },
    {
      id: "arjun-cipher",
      name: "Arjun Cipher",
      fanName: "Ciphercrew",
      oshiMark: "🧩",
      agencyId: "lotusframe",
      generation: "Gen 3",
      gender: "Male",
      debut: "2024-09-09",
      birthday: "04-17",
      height: "178 cm",
      languages: ["English", "Hindi", "Kannada"],
      platforms: ["YouTube", "Instagram"],
      contentType: ["Talk", "Puzzle"],
      tags: ["Puzzle", "Gen 3", "Kannada"],
      tier: "Rookie",
      color1: "#f472b6",
      color2: "#c084fc",
      illustrator: "@puzzleframe",
      live2dArtist: "Studio Kaze",
      shortDesc: "A riddle-loving newcomer who turns even grocery lists into puzzles.",
      bio: "Arjun Cipher debuted promising 'a mystery every stream' and has mostly delivered escape rooms, logic puzzles and the occasional unsolvable riddle he made up on the spot.",
      lore: "Arjun says his memories are 'locked behind a puzzle' he hasn't cracked yet. His chat has several competing theories.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "meher-solace",
      name: "Meher Solace",
      fanName: "Solacekeepers",
      oshiMark: "🕊",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2023-10-22",
      birthday: "08-25",
      height: "157 cm",
      languages: ["Hindi", "Urdu", "English"],
      platforms: ["YouTube", "Instagram"],
      contentType: ["Talk", "ASMR"],
      tags: ["Talk", "Indie", "Urdu"],
      tier: "Rising Star",
      color1: "#c084fc",
      color2: "#7dd3fc",
      illustrator: "@softline",
      live2dArtist: "Self-rigged",
      shortDesc: "A gentle late-night host for the streams that feel like a phone call with a friend.",
      bio: "Meher Solace runs low-key, low-lit just-chatting streams built for winding down — think shared playlists, quiet advice segments and the occasional guided breathing break.",
      lore: "Meher says she streams 'from the calm in-between hours' and refuses to say exactly where that is.",
      socials: { youtube: "#", instagram: "#" },
    },
  ];

  // Featured carousel picks — just an array of talent IDs, edit freely.
  const FEATURED_IDS = ["aria-vantara", "naina-frostveil", "rhea-monsoon", "kian-pixel", "tanish-orbit", "sana-willow"];

  const EVENTS = [
    {
      id: "starlight-relay",
      title: "Starlight Relay Concert",
      type: "Concert",
      date: "2026-09-14",
      description: "A cross-agency 3D concert featuring vocal sets from Starlace and Lotusframe talents.",
      participants: ["Aria Vantara", "Rhea Monsoon", "Sana Willow"],
      isPast: false,
    },
    {
      id: "monsoon-marathon",
      title: "Monsoon Horror Marathon",
      type: "Gaming Marathon",
      date: "2026-08-30",
      description: "A 12-hour horror-game relay across NeonVeda's roster, chat votes decide the next title.",
      participants: ["Naina Frostveil", "Myra Ember"],
      isPast: false,
    },
    {
      id: "indie-mixer",
      title: "Indie Talent Mixer",
      type: "Community Meetup",
      date: "2026-09-05",
      description: "An informal collab stream introducing newer independent talents to the wider community.",
      participants: ["Kian Pixel", "Isha Verdant", "Meher Solace", "Arjun Cipher"],
      isPast: false,
    },
    {
      id: "founders-anniversary",
      title: "Founders' Anniversary Stream",
      type: "Anniversary",
      date: "2026-06-18",
      description: "Devansh Riot celebrated three years live with a full retrospective and community Q&A.",
      participants: ["Devansh Riot"],
      isPast: true,
    },
    {
      id: "spring-debut-week",
      title: "Spring Debut Week",
      type: "Debut",
      date: "2026-03-02",
      description: "A shared debut week spotlighting Gen 3 talents across all three agencies.",
      participants: ["Myra Ember", "Tanish Orbit", "Arjun Cipher"],
      isPast: true,
    },
    {
      id: "winter-charity-sing",
      title: "Winter Charity Sing-Along",
      type: "Charity",
      date: "2026-01-20",
      description: "A donation-driven karaoke night raising funds for a regional literacy programme.",
      participants: ["Aria Vantara", "Kavi Nox", "Rhea Monsoon"],
      isPast: true,
    },
  ];

  // Small helper lookups built once from the raw data above.
  const agencyById = Object.fromEntries(AGENCIES.map((a) => [a.id, a]));
  const talentById = Object.fromEntries(TALENTS.map((t) => [t.id, t]));

  /*==================== STATE ====================*/
  const state = {
    query: "",
    filters: {
      agency: new Set(),
      language: new Set(),
      generation: new Set(),
      gender: new Set(),
      platform: new Set(),
      contentType: new Set(),
    },
    sort: "alphabetical",
  };

  /*==================== RENDERING — PORTRAITS ====================*/
  /**
   * Renders a placeholder "portrait" (gradient + initials) for a talent or
   * agency. Swap this for a real <img> by editing this function once real
   * artwork exists in assets/img/ — the rest of the site doesn't need to change.
   */
  function portraitStyle(color1, color2) {
    return `background:${gradientFrom(color1, color2)}`;
  }

  /*==================== RENDERING — TALENT CARDS ====================*/
  function talentCardHTML(talent) {
    const agency = agencyById[talent.agencyId];
    const platformBadges = talent.platforms
      .slice(0, 3)
      .map((p) => `<span class="platform-dot" title="${p}">${p.slice(0, 2).toUpperCase()}</span>`)
      .join("");

    return `
      <article class="talent-card" data-talent-id="${talent.id}" tabindex="0" role="button"
                aria-label="View profile: ${talent.name}">
        <div class="talent-card-inner">
          <div class="talent-portrait" style="${portraitStyle(talent.color1, talent.color2)}">
            <span class="portrait-rings"></span>
            <span class="portrait-glyph">${getInitials(talent.name)}</span>
            <span class="tier-ribbon">${talent.tier}</span>
            <span class="platform-row">${platformBadges}</span>
          </div>
          <h3 class="talent-name">${talent.name}</h3>
          <p class="talent-agency">${agency ? agency.shortName : "Independent"} · ${talent.generation}</p>
          <p class="talent-desc">${talent.shortDesc}</p>
          <div class="talent-tags">
            ${talent.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderTalentGrid() {
    const grid = $("#talentGrid");
    const emptyState = $("#emptyState");
    const results = getFilteredTalents();

    grid.innerHTML = results.map(talentCardHTML).join("");
    emptyState.hidden = results.length > 0;

    $("#resultsMeta").textContent = `${results.length} talent${results.length === 1 ? "" : "s"} found`;

    // Re-attach click/keyboard handlers to the freshly rendered cards.
    $$(".talent-card", grid).forEach((card) => {
      card.addEventListener("click", () => openTalentModal(card.dataset.talentId));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTalentModal(card.dataset.talentId);
        }
      });
    });
  }

  /*==================== FILTERS ====================*/
  const FILTER_DEFS = [
    { key: "agency", label: "Agency", values: () => AGENCIES.map((a) => ({ value: a.id, label: a.shortName })) },
    { key: "language", label: "Language", values: () => uniqueValues("languages") },
    { key: "generation", label: "Generation", values: () => uniqueValues("generation") },
    { key: "gender", label: "Gender", values: () => uniqueValues("gender") },
    { key: "platform", label: "Platform", values: () => uniqueValues("platforms") },
    { key: "contentType", label: "Content", values: () => uniqueValues("contentType") },
  ];

  function uniqueValues(field) {
    const set = new Set();
    TALENTS.forEach((t) => {
      const v = t[field];
      if (Array.isArray(v)) v.forEach((x) => set.add(x));
      else set.add(v);
    });
    return Array.from(set)
      .sort()
      .map((v) => ({ value: v, label: v }));
  }

  function buildFilterBar() {
    const wrap = $("#filterGroups");
    wrap.innerHTML = FILTER_DEFS.map((def) => {
      const chips = def
        .values()
        .map(
          (opt) =>
            `<button type="button" class="chip" data-filter-key="${def.key}" data-filter-value="${opt.value}">${opt.label}</button>`
        )
        .join("");
      return `<div class="filter-group"><span class="filter-group-label">${def.label}</span>${chips}</div>`;
    }).join("");

    $$(".chip[data-filter-key]", wrap).forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.filterKey;
        const value = chip.dataset.filterValue;
        const set = state.filters[key];
        if (set.has(value)) {
          set.delete(value);
          chip.classList.remove("is-active");
        } else {
          set.add(value);
          chip.classList.add("is-active");
        }
        renderTalentGrid();
      });
    });
  }

  function clearAllFilters() {
    Object.values(state.filters).forEach((set) => set.clear());
    $$(".chip.is-active").forEach((chip) => chip.classList.remove("is-active"));
    state.query = "";
    $("#directorySearchInput").value = "";
    $("#heroSearchInput").value = "";
    $("#navSearchInput").value = "";
    renderTalentGrid();
  }

  function talentMatchesFilters(talent) {
    const f = state.filters;
    if (f.agency.size && !f.agency.has(talent.agencyId)) return false;
    if (f.generation.size && !f.generation.has(talent.generation)) return false;
    if (f.gender.size && !f.gender.has(talent.gender)) return false;
    if (f.language.size && !talent.languages.some((l) => f.language.has(l))) return false;
    if (f.platform.size && !talent.platforms.some((p) => f.platform.has(p))) return false;
    if (f.contentType.size && !talent.contentType.some((c) => f.contentType.has(c))) return false;
    return true;
  }

  /*==================== SEARCH ====================*/
  function talentMatchesQuery(talent, query) {
    if (!query) return true;
    const agency = agencyById[talent.agencyId];
    const haystack = [
      talent.name,
      talent.fanName,
      agency ? agency.name : "Independent",
      talent.generation,
      talent.gender,
      ...talent.languages,
      ...talent.tags,
      ...talent.contentType,
      ...talent.platforms,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function getFilteredTalents() {
    const query = normalize(state.query);
    let results = TALENTS.filter((t) => talentMatchesFilters(t) && talentMatchesQuery(t, query));

    switch (state.sort) {
      case "newest":
        results = results.sort((a, b) => new Date(b.debut) - new Date(a.debut));
        break;
      case "oldest":
        results = results.sort((a, b) => new Date(a.debut) - new Date(b.debut));
        break;
      default:
        results = results.sort((a, b) => a.name.localeCompare(b.name));
    }
    return results;
  }

  function wireSearchInputs() {
    const inputs = [$("#directorySearchInput"), $("#heroSearchInput"), $("#navSearchInput")];

    function handleInput(value, source) {
      state.query = value;
      inputs.forEach((input) => {
        if (input !== source) input.value = value;
      });
      renderTalentGrid();
    }

    inputs.forEach((input) => {
      input.addEventListener("input", (e) => handleInput(e.target.value, e.target));
    });

    $("#heroSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("talents").scrollIntoView({ behavior: "smooth" });
    });

    $("#sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderTalentGrid();
    });

    $("#clearFiltersBtn").addEventListener("click", clearAllFilters);
  }

  /*==================== RENDERING — FEATURED SWIPER ====================*/
  function renderFeaturedSwiper() {
    const wrapper = $("#featuredSwiperWrapper");
    wrapper.innerHTML = FEATURED_IDS.map((id) => {
      const talent = talentById[id];
      if (!talent) return "";
      const agency = agencyById[talent.agencyId];
      return `
        <div class="swiper-slide">
          <article class="featured-card" style="${portraitStyle(talent.color1, talent.color2)}" data-talent-id="${talent.id}">
            <span class="featured-badge">${talent.tier} · ${agency ? agency.shortName : "Indie"}</span>
            <div class="featured-body">
              <h3>${talent.name}</h3>
              <p>${talent.shortDesc}</p>
            </div>
          </article>
        </div>
      `;
    }).join("");

    $$(".featured-card", wrapper).forEach((card) => {
      card.addEventListener("click", () => openTalentModal(card.dataset.talentId));
    });

    // eslint-disable-next-line no-undef
    new Swiper("#featuredSwiper", {
      slidesPerView: "auto",
      spaceBetween: 20,
      loop: true,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        0: { spaceBetween: 14 },
        640: { spaceBetween: 20 },
      },
    });
  }

  /*==================== RENDERING — AGENCIES ====================*/
  function agencyCardHTML(agency) {
    const roster = TALENTS.filter((t) => t.agencyId === agency.id);
    const talentChips = roster
      .map(
        (t) => `
        <button type="button" class="agency-talent-chip" data-talent-id="${t.id}">
          <span class="mini-glyph" style="${portraitStyle(t.color1, t.color2)}">${getInitials(t.name)}</span>
          ${t.name}
        </button>`
      )
      .join("");

    return `
      <div class="agency-card glass-panel">
        <div class="agency-head">
          <div class="agency-logo" style="${portraitStyle(agency.color1, agency.color2)}">${getInitials(agency.shortName)}</div>
          <div class="agency-title">
            <h3>${agency.name}</h3>
            <span>${roster.length} talent${roster.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <p class="agency-desc">${agency.description}</p>
        <div class="agency-meta">
          ${agency.website ? `<a class="mini-badge" href="${agency.website}">Website</a>` : ""}
          ${Object.keys(agency.socials || {})
            .map((key) => `<a class="mini-badge" href="${agency.socials[key]}">${key}</a>`)
            .join("")}
        </div>
        <button type="button" class="agency-toggle" data-agency-toggle="${agency.id}">
          <span>${roster.length ? "View roster" : "No talents yet"}</span>
          ${roster.length ? '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>' : ""}
        </button>
        <div class="agency-talent-list" id="roster-${agency.id}">${talentChips}</div>
      </div>
    `;
  }

  function renderAgencies() {
    const grid = $("#agencyGrid");
    grid.innerHTML = AGENCIES.map(agencyCardHTML).join("");

    $$(".agency-toggle", grid).forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.agencyToggle;
        const list = $(`#roster-${id}`);
        const isOpen = list.classList.toggle("is-open");
        btn.classList.toggle("is-open", isOpen);
      });
    });

    $$(".agency-talent-chip", grid).forEach((chip) => {
      chip.addEventListener("click", () => openTalentModal(chip.dataset.talentId));
    });
  }

  /*==================== RENDERING — EVENTS ====================*/
  function eventCardHTML(event) {
    const { day, mon } = formatDayMonth(event.date);
    return `
      <article class="event-card glass-panel ${event.isPast ? "is-past" : ""}">
        <div class="event-date-badge">
          <span class="day">${day}</span>
          <span class="mon">${mon}</span>
        </div>
        <span class="event-type">${event.type}</span>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="event-participants">
          ${event.participants.map((name) => `<span class="tag">${name}</span>`).join("")}
        </div>
      </article>
    `;
  }

  function renderEvents() {
    const upcoming = EVENTS.filter((e) => !e.isPast).sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = EVENTS.filter((e) => e.isPast).sort((a, b) => new Date(b.date) - new Date(a.date));

    $("#upcomingEvents").innerHTML = upcoming.map(eventCardHTML).join("");
    $("#pastEvents").innerHTML = past.map(eventCardHTML).join("");

    const tabUpcoming = $("#tabUpcoming");
    const tabPast = $("#tabPast");
    const panelUpcoming = $("#upcomingEvents");
    const panelPast = $("#pastEvents");

    function showTab(which) {
      const showUpcoming = which === "upcoming";
      tabUpcoming.classList.toggle("is-active", showUpcoming);
      tabPast.classList.toggle("is-active", !showUpcoming);
      tabUpcoming.setAttribute("aria-selected", String(showUpcoming));
      tabPast.setAttribute("aria-selected", String(!showUpcoming));
      panelUpcoming.hidden = !showUpcoming;
      panelPast.hidden = showUpcoming;
    }

    tabUpcoming.addEventListener("click", () => showTab("upcoming"));
    tabPast.addEventListener("click", () => showTab("past"));
  }

  /*==================== MODALS ====================*/
  function factRow(label, value) {
    if (!value) return "";
    return `<div class="fact-item"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function socialLinkHTML(platform, url) {
    const labels = {
      youtube: "YouTube",
      x: "X (Twitter)",
      twitch: "Twitch",
      instagram: "Instagram",
      discord: "Discord",
    };
    return `<a class="modal-link-btn" href="${url}" target="_blank" rel="noopener">${labels[platform] || platform}</a>`;
  }

  function openTalentModal(talentId) {
    const talent = talentById[talentId];
    if (!talent) return;
    const agency = agencyById[talent.agencyId];

    const content = `
      <div class="modal-banner" style="${portraitStyle(talent.color1, talent.color2)}">
        <div class="modal-portrait" style="${portraitStyle(talent.color2, talent.color1)}">${getInitials(talent.name)}</div>
      </div>
      <div class="modal-body">
        <div class="modal-body-head">
          <div>
            <h2 id="modalTalentName">${talent.name}</h2>
            <p class="modal-agency">${agency ? agency.name : "Independent"} · ${talent.tier}</p>
          </div>
        </div>

        <div class="modal-tags">
          ${talent.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>

        <div class="modal-bio">
          <h4>Biography</h4>
          <p>${talent.bio}</p>
        </div>

        <div class="modal-bio">
          <h4>Lore</h4>
          <p>${talent.lore}</p>
        </div>

        <dl class="modal-facts">
          ${factRow("Fan name", talent.fanName)}
          ${factRow("Oshi mark", talent.oshiMark)}
          ${factRow("Birthday", talent.birthday)}
          ${factRow("Height", talent.height)}
          ${factRow("Debut", formatDate(talent.debut))}
          ${factRow("Languages", talent.languages.join(", "))}
          ${factRow("Illustrator", talent.illustrator)}
          ${factRow("Live2D artist", talent.live2dArtist)}
        </dl>

        <div class="modal-links">
          <h4 style="width:100%;">Links &amp; platforms</h4>
          ${Object.entries(talent.socials || {})
            .map(([platform, url]) => socialLinkHTML(platform, url))
            .join("")}
        </div>
      </div>
    `;

    $("#modalContent").innerHTML = content;
    const overlay = $("#talentModalOverlay");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("#modalCloseBtn").focus();
  }

  function closeTalentModal() {
    const overlay = $("#talentModalOverlay");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function wireModal() {
    $("#modalCloseBtn").addEventListener("click", closeTalentModal);
    $("#talentModalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "talentModalOverlay") closeTalentModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#talentModalOverlay").hidden) closeTalentModal();
    });
  }

  /*==================== NAVIGATION ====================*/
  function wireHeaderScroll() {
    const header = $("#siteHeader");
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function wireMobileNav() {
    const toggle = $("#navToggle");
    const nav = $("#mainNav");
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    $$(".nav-link", nav).forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function wireNavSearchToggle() {
    const toggle = $("#navSearchToggle");
    const bar = $("#navSearchBar");
    toggle.addEventListener("click", () => {
      const isHidden = bar.hidden;
      bar.hidden = !isHidden;
      toggle.setAttribute("aria-expanded", String(isHidden));
      if (isHidden) $("#navSearchInput").focus();
    });
  }

  function wireActiveNavHighlight() {
    const sections = ["top", "talents", "agencies", "events", "about"].map((id) => document.getElementById(id));
    const links = $$(".nav-link");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => section && observer.observe(section));
  }

  function wireBackToTop() {
    const btn = $("#backToTop");
    window.addEventListener(
      "scroll",
      () => {
        btn.hidden = window.scrollY < 480;
      },
      { passive: true }
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /*==================== ANIMATIONS ====================*/
  function animateStats() {
    const dds = $$("#heroStats dd");
    const targets = [SITE_STATS.talents, SITE_STATS.agencies, SITE_STATS.projects, SITE_STATS.communityK];
    dds.forEach((dd, i) => dd.dataset.countTo = targets[i]);

    const duration = 1400;
    let started = false;

    function run() {
      if (started) return;
      started = true;
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        dds.forEach((dd) => {
          const target = Number(dd.dataset.countTo);
          const suffix = dd.dataset.suffix || "";
          dd.textContent = Math.round(target * eased) + suffix;
        });
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    );
    observer.observe($("#heroStats"));
  }

  function wireScrollReveal() {
    const revealEls = $$(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /*==================== INIT ====================*/
  function init() {
    $("#footerYear").textContent = new Date().getFullYear();

    buildFilterBar();
    renderTalentGrid();
    renderFeaturedSwiper();
    renderAgencies();
    renderEvents();

    wireSearchInputs();
    wireModal();
    wireHeaderScroll();
    wireMobileNav();
    wireNavSearchToggle();
    wireActiveNavHighlight();
    wireBackToTop();

    animateStats();
    wireScrollReveal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
