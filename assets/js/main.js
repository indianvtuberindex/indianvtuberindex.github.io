/*
  Indian VTuber Index — main.js
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeUrl(url) {
    const value = (url || "").toString().trim();
    return /^https?:\/\//i.test(value) ? value : "";
  }

  /*==================== PLATFORM ICONS ====================*/
  // Small recognizable glyphs so platform badges read at a glance instead
  // of showing two-letter initials. Add a new key here if a talent ever
  // lists a platform that isn't YouTube/Twitch/Instagram/Discord/X.
  const PLATFORM_ICONS = {
    YouTube:
      '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.54.5a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2 2c1.64.5 8.54.5 8.54.5s6.9 0 8.54-.5a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12ZM9.75 15.5v-7l6 3.5Z"/></svg>',
    Twitch:
      '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M4 2 2 6v14h6v2h4l2-2h4l4-4V2Zm16 11-3 3h-4l-2 2v-2H6V4h14ZM17 7v5h-2V7Zm-5 0v5H10V7Z"/></svg>',
    Instagram:
      '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>',
    Discord:
      '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M20 5.6a17.6 17.6 0 0 0-4.4-1.4l-.3.5c1.6.4 2.5.9 3.4 1.5-1.5-.7-2.9-1.2-4.7-1.2s-3.2.5-4.7 1.2c.9-.6 1.9-1.2 3.4-1.5l-.3-.5A17.6 17.6 0 0 0 8 5.6C6 8.6 5.4 11.5 5.6 14.4a17.7 17.7 0 0 0 4.7 2.4l.6-1c-.8-.3-1.6-.7-2.3-1.2.2.1.4.3.6.4a13 13 0 0 0 9.6 0c.2-.1.4-.3.6-.4-.7.5-1.5.9-2.3 1.2l.6 1a17.7 17.7 0 0 0 4.7-2.4c.3-3.4-.6-6.2-2.4-8.8ZM9.7 12.9c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm4.6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z"/></svg>',
    X: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M18.3 2H21l-6.4 7.3L22.3 22h-6.9l-5.4-6.6L3.7 22H1l6.9-7.9L1.7 2h7.1l4.9 6.1Zm-1.2 18h1.9L7 4h-2Z"/></svg>',
  };

  /** SVG icon for a platform, or its initials as a fallback for unknown ones. */
  function platformIcon(platform) {
    return PLATFORM_ICONS[platform] || `<span style="font-size:0.6rem;">${platform.slice(0, 2).toUpperCase()}</span>`;
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
      id: "project-starscape",
      name: "Project Starscape",
      shortName: "Starscape",
      image: "assets/img/starscape.png",
      // banner: "assets/img/agencies/project-starscape-banner.jpg",   ← optional card banner
      color1: "#a855f7",
      color2: "#6366f1",
      website: "#",
      description:
        "A multi-generation agency built around variety streaming, costubers and VTubers.",
      socials: { x: "#", youtube: "#", discord: "#" },
    },
    {
      id: "nijisanji-india",
      name: "Nijisanji India",
      shortName: "Nijisanji",
      color1: "#a855f7",
      color2: "#6366f1",
      website: "#",
      description:
        "a massive virtual YouTuber (VTuber) agency owned by ANYCOLOR Inc., featuring live-streaming Virtual Livers using Live2D models.",
      socials: { x: "https://x.com/NIJISANJI_World", youtube: "https://www.youtube.com/@nijisanji_en",},
    },
    {
      id: "wacconeind",
      name: "Waccone India",
      shortName: "Waccone",
      color1: "#38bdf8",
      color2: "#22d3ee",
      website: "#",
      description:
        "Bullshit agency.",
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
      id: "szivana",
      name: "Szivana Nabila",
      // image: "assets/img/missing.png",
      // banner: "assets/img/talents/szivana-banner.jpg",   ← add a separate, wide banner image here (reusing the portrait photo above causes a bad crop clash — see chat)
      fanName: "Gotimals",
      oshiMark: "✦",
      agencyId: "project-starscape",
      generation: "Gen 1",
      gender: "Female",
      debut: "2023-03-12",
      birthday: "05-14",
      height: "158 cm",
      languages: ["Hindi", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Singing", "Variety"],
      tags: ["VSinger", "Gen 1", "Hindi"],
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
      id: "kyra",
      name: "Kyra Ordos",
      // image: "assets/img/kyra.png",
      fanName: "SandDudes",
      oshiMark: "✨",
      agencyId: "project-starscape",
      generation: "Gen 2",
      gender: "Female",
      debut: "2022-08-02",
      birthday: "11-30",
      height: "176 cm",
      languages: ["English", "Hindi"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Gaming", "Variety"],
      tags: ["Gen 2", "Multilingual"],
      tier: "Icon",
      color1: "#e8f163",
      color2: "#e5f838",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A",
      bio: "N/A",
      lore: "The sands of an ancient desert manifest as Kyra Ordos. As old as time and as royal as the golden dunes she comes from Kyra is proud and strong.",
      socials: { youtube: "#", x: "#", twitch: "#", discord: "#" },
    },
    {
      id: "celestia",
      name: "Celestia Void",
      // image: "assets/img/celestia.png",
      fanName: "Humanlings",
      oshiMark: "👽",
      agencyId: "project-starscape",
      generation: "Gen 2",
      gender: "Female",
      debut: "2021-05-30",
      birthday: "07-09",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Gaming", "Variety"],
      tags: ["FPS", "Gen 2"],
      tier: "Rising Star",
      color1: "#fb7185",
      color2: "#f472b6",
      illustrator: "@doodlebynilu",
      live2dArtist: "Rigwork Collective",
      shortDesc: "A competitive FPS ace with a habit of narrating her own highlight reels live.",
      bio: "Alien VTuber",
      lore: "Celestia's ship crashlanded on Earth when traversing a wormhole. Since she has an indeterminate time to kill before her rescue fleet arrives, she will be spending her time on the planet connecting with earthlings through her live streams.",
      socials: { youtube: "#", x: "#", twitch: "#" },
    },
    {
      id: "noor",
      name: "Noor",
      // image: "assets/img/noor.png",
      fanName: "Noormies",
      oshiMark: "💎♦️",
      agencyId: "nijisanji-india",
      generation: "Gen 1",
      gender: "Male",
      debut: "2020-01-23",
      birthday: "04-24",
      height: "169 cm",
      languages: [ "Japanese", "English"],
      platforms: ["YouTube"],
      contentType: ["Gaming", "Music"],
      tags: ["Gaming", "Gen 1"],
      tier: "One of a Kind",
      color1: "#38bdf8",
      color2: "#22d3ee",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "Noor was a female Indian Virtual YouTuber affiliated with NIJISANJI IN,NIJISANJI's English-speaking Virtual Liver branch based in India,alongside with Vihaan, and Aadya. She was an Indian alchemist.",
      bio: "N/A",
      lore: "She is an Indian alchemist who enjoys chaotic gaming, chats, and interacting with her community.",
      socials: { youtube: "https://www.youtube.com/channel/UC6oW4FXETgEGOFTxWmI2h5Q", x: "https://x.com/Noor_VTuber" },
    },
    {
      id: "vihaan",
      name: "Vihaan",
      // image: "assets/img/vihaan.png",
      fanName: "Vihaboos",
      oshiMark: "🥒",
      agencyId: "nijisanji-india",
      generation: "Gen 1",
      gender: "Male",
      debut: "2021-01-30",
      birthday: "03-21",
      height: "190 cm",
      languages: ["English"],
      platforms: ["YouTube"],
      contentType: ["Gaming", "chatting"],
      tags: ["#Vihaart"],
      tier: "One of a Kind",
      color1: "#34d399",
      color2: "#38bdf8",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "Vihaan was a male Indian Virtual YouTuber affiliated with NIJISANJI IN,NIJISANJI's English-speaking Virtual Liver branch based in India,alongside with Aadya, and Noor.",
      bio: "N/A",
      lore: " he was a liver-based Virtual YouTuber with a simple, grounded official profile.",
      socials: { youtube: "https://www.youtube.com/@vihaannijisanjiin8640", instagram: "https://www.instagram.com/vihaan_vtuber/", x: "https://x.com/Vihaan_VTuber" },
    },
    {
      id: "aadya",
      name: "Aadya",
      // image: "assets/img/aadya.png",
      fanName: ["Chaadya", "Chaads"],
      oshiMark: "🌸",
      agencyId: "nijisanji-india",
      generation: "Gen 1",
      gender: "Female",
      debut: "2021-01-30",
      birthday: "10-31",
      height: "165 cm",
      languages: ["English"],
      platforms: ["YouTube"],
      contentType: ["Singing", "Talk"],
      tags: ["VSinger", "Gen 1", "Malayalam"],
      tier: "One of a Kind",
      color1: "#D4AF37",
      color2: "#f16371",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "Aadya was a female Indian Virtual YouTuber affiliated with NIJISANJI IN,NIJISANJI's English-speaking Virtual Liver branch based in India,alongside with Vihaan and Noor.",
      bio: "Aadya sings best when it's raining — which, suspiciously, is most of the time she's live. Weekly acoustic sessions, chatty just-talking streams and the odd rooftop-themed set.",
      lore: "Aadya insists she can 'summon' light drizzle mid-song. Meteorologists remain unconvinced; her chat remains delighted.",
      socials: { youtube: "https://www.youtube.com/@aadyanijisanjiin1051", x: "https://x.com/Aadya_VTuber" },
    },
    {
      id: "fox-steyna",
      name: "Fox Steyna",
      // image: "assets/img/fox-steyna.png",
      fanName: "Steynistas",
      oshiMark: "🦊",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
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
      illustrator: "@foxsteyna",
      live2dArtist: "Self-rigged",
      shortDesc: "N/A",
      bio: "TO BE UPDATED",
      lore: "Burned out by an endless cycle of work and loneliness, a young woman falls asleep at her desk after another exhausting night. When a mysterious force pulls her into a digital world, she awakens as a Kitsune. a mystical fox spirit known for wisdom, illusion, and storytelling. Given a second chance at life, she embraces her new identity and becomes a VTuber, using her voice and stories to bring joy to others while slowly healing the scars left by the life she could never escape.",
      socials: { youtube: "https://www.youtube.com/@FoxSteyna", x: "https://x.com/FoxSteyna" },
    },
    {
      id: "nyxietv",
      name: "NyxieTV",
      // image: "assets/img/nyxietv.png",
      fanName: "Verdants",
      oshiMark: "🍃",
      agencyId: "indie",
      generation: "Indie",
      gender: "UN",
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
      id: "victor-mrinmoy",
      name: "Victor Mrinmoy",
      // image: "assets/img/victor-mrinmoy.png",
      fanName: "Orbiters",
      oshiMark: "🪐",
      agencyId: "indie",
      generation: "indie",
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
      id: "kaede-kinmochi",
      name: "Kaede Kinmochi",
      // image: "assets/img/kaede-kinmochi.png",
      fanName: "update it",
      oshiMark: "❄",
      agencyId: "indie",
      generation: "indie",
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
      id: "suzuki-zuriko",
      name: "Suzuki Zuriko",
      // image: "assets/img/suzuki-zuriko.png",
      fanName: "Zurikos",
      oshiMark: "🌸",
      agencyId: "indie",
      generation: "indie",
      gender: "Female",
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
      bio: "Zuriko Suzuki debuted promising 'a mystery every stream' and has mostly delivered escape rooms, logic puzzles and the occasional unsolvable riddle he made up on the spot.",
      lore: "Zuriko says his memories are 'locked behind a puzzle' he hasn't cracked yet. His chat has several competing theories.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "mythicwhale",
      name: "MythicWhale",
      // image: "assets/img/mythicwhale.png",
      fanName: "BLEH",
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
    {
      id: "afroznthorn",
      name: "AFroznThorn",
      // image: "assets/img/afroznthorn.png",
      fanName: "BLEH",
      oshiMark: "🕊",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2025-07-16",
      birthday: "08-25",
      height: "157 cm",
      languages: ["Hindi", "Urdu", "English"],
      platforms: ["YouTube", "Instagram"],
      contentType: ["Talk", "ASMR"],
      tags: ["Talk", "Indie", "Urdu"],
      tier: "Rising Star",
      color1: "#2d005b",
      color2: "#f3ff72",
      illustrator: "@softline",
      live2dArtist: "Self-rigged",
      shortDesc: "A gentle late-night host for the streams that feel like a phone call with a friend.",
      bio: "Meher Solace runs low-key, low-lit just-chatting streams built for winding down — think shared playlists, quiet advice segments and the occasional guided breathing break.",
      lore: "Meher says she streams 'from the calm in-between hours' and refuses to say exactly where that is.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "soulofswords",
      name: "Soulofswords",
      // image: "assets/img/soulofswords.png",
      fanName: "BLEH",
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
      color1: "#84fcf2",
      color2: "#001195",
      illustrator: "@softline",
      live2dArtist: "Self-rigged",
      shortDesc: "A gentle late-night host for the streams that feel like a phone call with a friend.",
      bio: "Meher Solace runs low-key, low-lit just-chatting streams built for winding down — think shared playlists, quiet advice segments and the occasional guided breathing break.",
      lore: "Meher says she streams 'from the calm in-between hours' and refuses to say exactly where that is.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "emonwell",
      name: "Emonwell",
      // image: "assets/img/emonwell.png",
      fanName: "BLEH",
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
      color1: "#84fcf2",
      color2: "#8997ff",
      illustrator: "@softline",
      live2dArtist: "Self-rigged",
      shortDesc: "A gentle late-night host for the streams that feel like a phone call with a friend.",
      bio: "Meher Solace runs low-key, low-lit just-chatting streams built for winding down — think shared playlists, quiet advice segments and the occasional guided breathing break.",
      lore: "Meher says she streams 'from the calm in-between hours' and refuses to say exactly where that is.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "ichigo",
      name: "Ichigo",
      // image: "assets/img/ichigo.png",
      fanName: "BLEH",
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
      color1: "#84fcf2",
      color2: "#ff0000",
      illustrator: "@softline",
      live2dArtist: "Self-rigged",
      shortDesc: "A gentle late-night host for the streams that feel like a phone call with a friend.",
      bio: "Meher Solace runs low-key, low-lit just-chatting streams built for winding down — think shared playlists, quiet advice segments and the occasional guided breathing break.",
      lore: "Meher says she streams 'from the calm in-between hours' and refuses to say exactly where that is.",
      socials: { youtube: "#", instagram: "#" },
    },
    {
      id: "joqniX",
      name: "JoqniX",
      // image: "assets/img/joqniX.png",
      fanName: "Konztellers",
      oshiMark: "🎋🌟🌠",
      agencyId: "indie",
      generation: "Indie",
      gender: "Whatever you want Joq to be",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Japanese", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "Founding Member",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "@ZucciAgasura",
      live2dArtist: "@ma_medha",
      shortDesc: "JoqniX (ジョクニクス) is an Independent English-speaking Indian Virtual YouTuber.",
      bio: "An Celestial Constellation who is on a adventuring journey travelling worlds and meeting new people.",
      lore: "Joq's content primarily consists of gaming, chatting, music, and creative projects. JoqniX is recognized for his warm personality, engaging storytelling, and multilingual content.",
      socials: { youtube: "https://www.youtube.com/@joqnix", instagram: "https://www.instagram.com/joqnix", x: "https://x.com/joqnix", twitch: "https://www.twitch.tv/joqnix" },
    },
    {
      id: "nito-kuraragi",
      name: "Nito Kuraragi",
      // image: "assets/img/nito-kuraragi.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Whatever you want Joq to be",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Japanese", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A",
      bio: "N/A.",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "shabby",
      name: "Shabby",
      // image: "assets/img/shabby.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Whatever you want Joq to be",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Japanese", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A",
      bio: "N/A.",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "calx-nyx",
      name: "Calx Nyx",
      // image: "assets/img/calx-nyx.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Male",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Japanese", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "Self-illustrated",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "kotomi-shio",
      name: "Kotomi Shio",
      // image: "assets/img/kotomi-shio.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Japanese", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "Self-illustrated",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "rain-peter-chan ",
      name: "Rain Peter Chan",
      // image: "assets/img/rain-peter-chan.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Hindi", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "Self-illustrated",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "peter-sota",
      name: "Peter Sota",
      // image: "assets/img/peter-sota.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Hindi", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "Self-illustrated",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "abhyokami",
      name: "AbhyOkami",
      // image: "assets/img/abhyokami.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["Hindi", "English"],
      platforms: ["YouTube", "Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "Self-illustrated",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "whimsymage",
      name: "WhimsyMage",
      // image: "assets/img/whimsymage.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "@tia_illustrates",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "shoka-sorai",
      name: "Shoka Sorai",
      // image: "assets/img/shoka-sorai.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "pokii-chii",
      name: "PokiiChii",
      // image: "assets/img/pokii-chii.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Kick", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", kick: "#" },
    },
    {
      id: "luckyowl-uwu",
      name: "LuckyOwl_UwU",
      // image: "assets/img/luckyowl-uwu.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Kick", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", kick: "#" },
    },
    {
      id: "katara-muroi",
      name: "Katara Muroi",
      // image: "assets/img/katara-muroi.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "bam-vanessa",
      name: "Bam Vanessa",
      // image: "assets/img/bam-vanessa.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "sorapuff",
      name: "SoraPuff",
      // image: "assets/img/sorapuff.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "esther-emberwood",
      name: "Esther Emberwood",
      // image: "assets/img/esther-emberwood.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "iruma-vitale",
      name: "Iruma Vitale",
      image: "assets/img/iruma.png",
      fanName: "N/A",
      oshiMark: "♠️",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2025-04-13",
      birthday: "09-12",
      height: "170 cm",
      languages: ["English", "Hindi"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "Founder",
      color1: "#fc848c",
      color2: "#ff0004",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "https://www.youtube.com/@irumaVT", instagram: "https://www.instagram.com/iruma.vt", x: "https://x.com/iruma_vt", twitch: "https://www.twitch.tv/iruma_vt" },
    },
    {
      id: "spirit-dabbles",
      name: "Spirit Dabbles",
      image: "assets/img/spirit-dabbles.png",
      fanName: "Spartans",
      oshiMark: "🫃",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2024-09-21",
      birthday: "02-27",
      height: "136 cm",
      languages: ["English", "Hindi", "Bhojpuri"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "Bihari",
      color1: "#84fcbc",
      color2: "#3cff4c",
      illustrator: "DG_studio@Art&Live2D",
      live2dArtist: "DG_studio@Art&Live2D",
      shortDesc: "One and Only Bihari VTuber.",
      bio: "N/A",
      lore: "Just a ded ass Spirit",
      socials: { youtube: "https://www.youtube.com/@SpiritDabbles", instagram: "https://www.instagram.com/freespirit_vt/", x: "https://x.com/SpiritVTin", twitch: "https://www.twitch.tv/spiritfree_vt" },
    },
    {
      id: "nyx-later",
      name: "Nyx Late",
      // image: "assets/img/nyx-later.png",
      fanName: "Moonlings",
      oshiMark: "🌙",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "https://www.youtube.com/@NyxLate", instagram: "https://www.instagram.com/nyxlate/", x: "https://x.com/nyxlate", twitch: "https://www.twitch.tv/nyxlate" },
    },
    {
      id: "moonie-freak",
      name: "Moonie Frea",
      image: "assets/img/moonie-freak.png",
      banner: "assets/img/moonie-freak-banner.png",
      fanName: "stars",
      oshiMark: "🌙🐾",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2023-12-27",
      birthday: "06-17",
      height: "200 cm",
      languages: ["English", "Hindi"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "One of a Kind",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "@Six2Sundown",
      live2dArtist: "@Six2Sundown",
      shortDesc: "The prettiest girl in the pawry, from the moon.",
      bio: "An artist who loves hot fictional man and ofc her friends UwU",
      lore: "Moonie Frea was the queen of the Moonriver, the moon from another universe. However, one day Moonriver was invaded, and she could not save her subjects, leading to it getting destroyed. In rage, she tried to attack the king. Unfortunately, she instantly got teleported to the current moon. Seeing it empty, she took it upon herself to be the ruler of the moon. Now, she occasionally visits Earth to make new friends as she slowly recovers her power so she can protect people better now.",
      socials: { youtube: "https://www.youtube.com/@MoonieFrea", instagram: "https://www.instagram.com/mooniefrea/", x: "https://x.com/mooniefrea", twitch: "https://www.twitch.tv/moonie_frea",Vgen: "https://vgen.co/mooniefrea"},
    },
    {
      id: "yoshialive",
      name: "Yoshia Live",
      // image: "assets/img/yoshia-live.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "suwumi",
      name: "Suwumi",
      // image: "assets/img/suwumi.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "mitchsenpai",
      name: "MitchSenpai",
      // image: "assets/img/mitchsenpai.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English"],
      platforms: ["Twitch", "YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "panditji",
      name: "Panditji",
      // image: "assets/img/panditji.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "kai-aspen",
      name: "Kai Aspen",
      // image: "assets/img/kai-aspen.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "meowcatmax",
      name: "MeowCatMax",
      // image: "assets/img/meowcatmax.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "mirai-moonlight",
      name: "Mirai Moonlight",
      // image: "assets/img/mirai-moonlight.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "aina-rose",
      name: "Aina Rose",
      // image: "assets/img/aina-rose.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "mangledstaid",
      name: "MangledStaiD",
      // image: "assets/img/mangledstaid.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "animinaty",
      name: "Animinaty",
      // image: "assets/img/animinaty.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "genzgamer",
      name: "GenZgamer",
      // image: "assets/img/genzgamer.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "cozymammothvt",
      name: "CozyMammothVT",
      // image: "assets/img/cozymammoth-vt.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "vtuber-arjun",
      name: "Vtuber Arjun",
      // image: "assets/img/vtuber-arjun.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "shruti-vtuber",
      name: "Shruti VTuber",
      // image: "assets/img/shruti-vtuber.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "cherry-ito",
      name: "Cherry Ito",
      // image: "assets/img/cherry-ito.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "alexa-soto",
      name: "AlexaSoto",
      // image: "assets/img/alexa-soto.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "tattooed-panda",
      name: "Tattooed Panda",
      // image: "assets/img/tattooed-panda.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "seggsy",
      name: "Seggsy",
      // image: "assets/img/seggsy.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "sunherah-code",
      name: "Sunherah Code",
      // image: "assets/img/sunherah-code.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "luna-miura",
      name: "Luna Miura",
      // image: "assets/img/luna-miura.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "arashie",
      name: "Arashie",
      // image: "assets/img/arashie.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "tashiro-hayaa",
      name: "Tashiro Hayaa",
      // image: "assets/img/tashiro-hayaa.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "missluv",
      name: "MissLuv",
      // image: "assets/img/missluv.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "surya",
      name: "Surya",
      // image: "assets/img/surya.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "yoshino-forger",
      name: "Yoshino Forger",
      // image: "assets/img/yoshino-forger.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "miko-bunny",
      name: "Miko Bunny",
      // image: "assets/img/miko-bunny.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "joxifer",
      name: "Joxifer",
      // image: "assets/img/joxifer.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "peekart",
      name: "Peekart",
      // image: "assets/img/peekart.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "nekogami",
      name: "Nekogami",
      // image: "assets/img/nekogami.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "vtuber-superhero",
      name: "Vtuber Superhero",
      // image: "assets/img/vtuber-superhero.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "coffeeeval",
      name: "CoffeeeVal",
      // image: "assets/img/coffeeeval.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "artynyx-beau",
      name: "Artynyx Beau",
      // image: "assets/img/artynyx-beau.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "azura-lapis",
      name: "Azura Lapis",
      // image: "assets/img/azura-lapis.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "breadguy007",
      name: "BreaDGuy007",
      // image: "assets/img/breadguy007.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "calx-nyx",
      name: "Calx Nyx",
      // image: "assets/img/calx-nyx.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "jasminvuvt",
      name: "JasminVuVT",
      // image: "assets/img/jasminvuvt.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "yoursenpaiplays",
      name: "YourSenpaiPlays",
      // image: "assets/img/yoursenpaiplays.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "dariruupom",
      name: "DariRuuPom",
      // image: "assets/img/dariruupom.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "daze",
      name: "DAZE",
      // image: "assets/img/daze.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#84fcf2",
      color2: "#f78dff",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "dragnozer",
      name: "Dragnozer",
      // image: "assets/img/dragnozer.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#2ded4d",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "ellieicegoddess",
      name: "EllieIceGoddess",
      // image: "assets/img/ellieicegoddess.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#2ded4d",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "everest-fuji",
      name: "Everest Fuji",
      // image: "assets/img/everest-fuji.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#2ded4d",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "hanhan-px",
      name: "Hanhan Px",
      // image: "assets/img/hanhan-px.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#f8ffb7",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "wreo-indus",
      name: "Wreo indus",
      // image: "assets/img/wreo-indus.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#f8ffb7",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "jmandono",
      name: "JmanDono",
      // image: "assets/img/wreo-indus.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffdd61",
      color2: "#f8ffb7",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "jalpariop",
      name: "JalpariOp",
      // image: "assets/img/jalpariop.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "koki-najma",
      name: "Koki Najma",
      // image: "assets/img/koki-najma.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "lord-headass",
      name: "Lord HeadAss",
      // image: "assets/img/lord-headass.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#ffffff",
      color2: "#55cdee",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "kreotu",
      name: "Kreotu",
      // image: "assets/img/kreotu.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "maskon",
      name: "MasKon",
      // image: "assets/img/maskon.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "nenu-mi-z1r0",
      name: "Nenu Mi Z1R0",
      // image: "assets/img/nenu-mi-z1r0.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "procarzz",
      name: "Procarzz",
      // image: "assets/img/procarzz.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "rxr404",
      name: "RxR404",
      // image: "assets/img/rxr404.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "s4both",
      name: "S4bOTh",
      // image: "assets/img/s4both.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "salty-furret",
      name: "Salty Furret",
      // image: "assets/img/salty-furret.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "scmore",
      name: "SCMORE",
      // image: "assets/img/scmore.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "shuuma-fro",
      name: "Shuuma Fro",
      // image: "assets/img/shuuma-fro.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "sojasu",
      name: "Sojasu",
      // image: "assets/img/sojasu.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "simply-scripts",
      name: "Simply Scripts",
      // image: "assets/img/simply-scripts.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "totembtw",
      name: "Totembtw",
      // image: "assets/img/totembtw.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "vasukivt",
      name: "VasukiVT",
      // image: "assets/img/vasukivt.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
    {
      id: "viola-santiago",
      name: "Viola Santiago",
      // image: "assets/img/viola-santiago.png",
      fanName: "N/A",
      oshiMark: "N/A",
      agencyId: "indie",
      generation: "Indie",
      gender: "Female",
      debut: "2020-09-23",
      birthday: "08-11",
      height: "N/A",
      languages: ["English", "Hindi"],
      platforms: ["YouTube"],
      contentType: ["Talk", "Gaming"],
      tags: ["Talk", "Indie"],
      tier: "N/A",
      color1: "#9861ff",
      color2: "#b60bfa",
      illustrator: "N/A",
      live2dArtist: "N/A",
      shortDesc: "N/A.",
      bio: "N/A",
      lore: "N/A",
      socials: { youtube: "#", instagram: "#", x: "#", twitch: "#" },
    },
  ];

  // Featured carousel picks — just an array of talent IDs, edit freely.
  const FEATURED_IDS = [ "noor", "kian-pixel", "tanish-orbit", "sana-willow", "iruma-vitale", "spirit-dabbles", "moonie-freak", "nyx-later" ];

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

  /**
   * Renders an <img> layer for a real photo/logo, or an empty string when
   * no path is set. `onerror` removes the broken <img> so the gradient +
   * initials placeholder underneath it (already in the markup) shows
   * through instead of a broken-image icon.
   */
  function imageLayerHTML(src, alt, className) {
    if (!src) return "";
    return `<img src="${src}" alt="${alt}" class="${className}" onerror="this.remove()">`;
  }

  /*==================== RENDERING — TALENT CARDS ====================*/
  function talentCardHTML(talent) {
    const agency = agencyById[talent.agencyId];
    const platformBadges = talent.platforms
      .slice(0, 3)
      .map((p) => `<span class="platform-dot" title="${p}">${platformIcon(p)}</span>`)
      .join("");

    return `
      <article class="talent-card" data-talent-id="${talent.id}" tabindex="0" role="button"
                aria-label="View profile: ${talent.name}">
        <div class="talent-card-inner">
          <div class="talent-portrait" style="${portraitStyle(talent.color1, talent.color2)}">
            <span class="portrait-rings"></span>
            ${imageLayerHTML(talent.image, talent.name, "portrait-photo")}
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

  function hexColorToDecimal(hex) {
    const normalized = (hex || "").toString().trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    return parseInt(normalized, 16);
  }

  function buildEmbedObject() {
    const title = $("#embedTitleInput").value.trim();
    const description = $("#embedDescriptionInput").value.trim();
    const url = sanitizeUrl($("#embedUrlInput").value);
    const colorHex = $("#embedColorInput").value.trim();
    const authorName = $("#embedAuthorNameInput").value.trim();
    const authorIcon = sanitizeUrl($("#embedAuthorIconInput").value);
    const thumbnail = sanitizeUrl($("#embedThumbnailInput").value);
    const image = sanitizeUrl($("#embedImageInput").value);
    const footerText = $("#embedFooterTextInput").value.trim();
    const footerIcon = sanitizeUrl($("#embedFooterIconInput").value);
    const timestampInput = $("#embedTimestampInput").value;

    const embed = {};
    if (title) embed.title = title;
    if (description) embed.description = description;
    if (url) embed.url = url;

    const colorValue = hexColorToDecimal(colorHex);
    if (colorValue !== null) embed.color = colorValue;

    if (authorName || authorIcon) {
      embed.author = {};
      if (authorName) embed.author.name = authorName;
      if (authorIcon) embed.author.icon_url = authorIcon;
    }

    if (thumbnail) embed.thumbnail = { url: thumbnail };
    if (image) embed.image = { url: image };

    const fields = [];
    for (let i = 1; i <= 3; i += 1) {
      const name = $(`#embedFieldName${i}`).value.trim();
      const value = $(`#embedFieldValue${i}`).value.trim();
      const inline = $(`#embedFieldInline${i}`).checked;
      if (name || value) {
        fields.push({
          name: name || "\u200b",
          value: value || "\u200b",
          inline,
        });
      }
    }
    if (fields.length) embed.fields = fields;

    if (footerText || footerIcon) {
      embed.footer = {};
      if (footerText) embed.footer.text = footerText;
      if (footerIcon) embed.footer.icon_url = footerIcon;
    }

    if (timestampInput) {
      const date = new Date(timestampInput);
      if (!Number.isNaN(date.valueOf())) {
        embed.timestamp = date.toISOString();
      }
    }

    return embed;
  }

  function renderEmbedPreview() {
    const embed = buildEmbedObject();
    const bar = $("#embedPreviewBar");
    const preview = $("#discordEmbedPreview");
    const authorRow = $("#embedPreviewAuthor");
    const authorIcon = $("#embedPreviewAuthorIcon");
    const authorName = $("#embedPreviewAuthorName");
    const titleLink = $("#embedPreviewTitleLink");
    const titleEl = $("#embedPreviewTitle");
    const descriptionEl = $("#embedPreviewDescription");
    const fieldsEl = $("#embedPreviewFields");
    const imageEl = $("#embedPreviewImage");
    const thumbEl = $("#embedPreviewThumbnail");
    const footerEl = $("#embedPreviewFooter");
    const footerIcon = $("#embedPreviewFooterIcon");
    const footerText = $("#embedPreviewFooterText");
    const timestampText = $("#embedPreviewTimestamp");
    const jsonOutput = $("#embedJsonOutput");

    const colorHex = $("#embedColorInput").value.trim() || "#5865f2";
    bar.style.background = colorHex;
    preview.style.borderColor = `${colorHex}55`;

    if (embed.author && (embed.author.name || embed.author.icon_url)) {
      authorRow.style.display = "flex";
      if (embed.author.icon_url) {
        authorIcon.src = embed.author.icon_url;
        authorIcon.style.display = "inline-block";
      } else {
        authorIcon.removeAttribute("src");
        authorIcon.style.display = "none";
      }
      authorName.textContent = embed.author.name || "Author name";
    } else {
      authorRow.style.display = "none";
      authorIcon.removeAttribute("src");
    }

    if (embed.title) {
      titleEl.textContent = embed.title;
      titleLink.href = embed.url || "#";
    } else {
      titleEl.textContent = "Embed title";
      titleLink.href = "#";
    }

    descriptionEl.textContent = embed.description || "A preview of your description will appear here as you type it.";

    fieldsEl.innerHTML = embed.fields
      ? embed.fields
          .map(
            (field) =>
              `<div class="discord-embed-field${field.inline ? " discord-embed-field--inline" : ""}"><div class="discord-embed-field-name">${escapeHtml(field.name)}</div><div class="discord-embed-field-value">${escapeHtml(field.value)}</div></div>`
          )
          .join("")
      : "";

    if (embed.image && embed.image.url) {
      imageEl.src = embed.image.url;
      imageEl.style.display = "block";
    } else {
      imageEl.removeAttribute("src");
      imageEl.style.display = "none";
    }

    if (embed.thumbnail && embed.thumbnail.url) {
      thumbEl.src = embed.thumbnail.url;
      thumbEl.style.display = "block";
    } else {
      thumbEl.removeAttribute("src");
      thumbEl.style.display = "none";
    }

    if (embed.footer && (embed.footer.text || embed.footer.icon_url)) {
      footerEl.style.display = "flex";
      footerText.textContent = embed.footer.text || "";
      if (embed.footer.icon_url) {
        footerIcon.src = embed.footer.icon_url;
        footerIcon.style.display = "inline-block";
      } else {
        footerIcon.removeAttribute("src");
        footerIcon.style.display = "none";
      }
    } else {
      footerEl.style.display = "none";
      footerIcon.removeAttribute("src");
      footerText.textContent = "";
    }

    if (embed.timestamp) {
      timestampText.textContent = new Date(embed.timestamp).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      timestampText.textContent = "";
    }

    jsonOutput.textContent = JSON.stringify({ embeds: [embed] }, null, 2);
  }

  function wireEmbedBuilder() {
    const fields = [
      "#embedTitleInput",
      "#embedDescriptionInput",
      "#embedUrlInput",
      "#embedColorInput",
      "#embedAuthorNameInput",
      "#embedAuthorIconInput",
      "#embedThumbnailInput",
      "#embedImageInput",
      "#embedFieldName1",
      "#embedFieldValue1",
      "#embedFieldName2",
      "#embedFieldValue2",
      "#embedFieldName3",
      "#embedFieldValue3",
      "#embedFieldInline1",
      "#embedFieldInline2",
      "#embedFieldInline3",
      "#embedFooterTextInput",
      "#embedFooterIconInput",
      "#embedTimestampInput",
    ]; 

    fields.forEach((selector) => {
      const input = $(selector);
      if (input) {
        input.addEventListener("input", renderEmbedPreview);
      }
    });

    $("#copyEmbedJsonBtn").addEventListener("click", () => {
      const text = $("#embedJsonOutput").textContent;
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    });

    renderEmbedPreview();
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
            ${imageLayerHTML(talent.image, talent.name, "featured-photo")}
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
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
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
          <span class="mini-glyph" style="${portraitStyle(t.color1, t.color2)}">
            ${imageLayerHTML(t.image, t.name, "mini-glyph-photo")}
            ${getInitials(t.name)}
          </span>
          ${t.name}
        </button>`
      )
      .join("");

    return `
      <div class="agency-card glass-panel">
        ${imageLayerHTML(agency.banner, agency.name, "agency-banner-photo")}
        <div class="agency-head">
          <div class="agency-logo" style="${portraitStyle(agency.color1, agency.color2)}">
            ${imageLayerHTML(agency.image, agency.name, "logo-photo")}
            ${getInitials(agency.shortName)}
          </div>
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
        ${imageLayerHTML(event.image, event.title, "event-banner-photo")}
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
        ${imageLayerHTML(talent.banner, talent.name, "banner-photo")}
        <div class="modal-portrait" style="${portraitStyle(talent.color2, talent.color1)}">
          ${imageLayerHTML(talent.image, talent.name, "portrait-photo")}
          ${getInitials(talent.name)}
        </div>
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
    const sections = ["top", "talents", "agencies", "events", "about", "embedBuilder"].map((id) => document.getElementById(id));
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
    wireEmbedBuilder();
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
