# VTuber DB

A modern, self-contained VTuber database website inspired by [Amatsukaze](https://amatsukaze.rl404.com/vtubers). No build step, no backend — just one HTML file deployable to GitHub Pages in minutes.

## ✨ Pages & Features

| Page | What it does |
|------|-------------|
| **Home** | Hero landing with live counts |
| **VTubers** | Filterable grid — search by name, filter by status/agency, sort by subs/debut |
| **Agencies** | Sortable agency list with member counts and total subscribers |
| **Videos** | Video archive with search, filter by VTuber, sort by date/views/duration |
| **Events** | Birthday & anniversary calendar |
| **Statistics** | Charts — status breakdown, model type, gender, language, top subs, agency sizes |
| **Compare** | Side-by-side comparison of up to 4 VTubers |

## 🚀 Deploy to GitHub Pages (3 steps)

1. **Create a new GitHub repo** and push this folder to the `main` branch.
2. In your repo → **Settings → Pages → Source → GitHub Actions**.
3. Push (or trigger the workflow manually). Your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

That's it — the GitHub Actions workflow (`.github/workflows/deploy.yml`) handles everything automatically.

## 🛠 Add Your Own Data

All VTuber, agency, event, and video data lives in the `<script>` block inside `index.html` (search for `const AGENCIES =`). Edit the arrays directly:

```js
const VTUBERS = [
  {
    id: "my-vtuber",            // unique slug
    name: "My VTuber",
    image: "https://...",       // portrait URL (optional)
    agency: "my-agency",        // must match an agency id
    status: "active",           // "active" | "retired"
    debut: "2023-04-01",        // YYYY-MM-DD
    retired: null,              // YYYY-MM-DD or null
    subscribers: 500_000,
    channel: "https://youtube.com/@...",
    channelType: "youtube",
    gender: "female",
    model: "2D",                // "2D" | "3D"
    language: "English",
    designer: "Designer Name",
    modeler2d: "Modeler Name",
    modeler3d: null,
    birthday: "April 1",
    height: 160,                // cm (or null)
    weight: null,               // kg (or null)
    bloodType: "A",             // or null
    zodiac: "Aries",
    description: "Short bio...",
    tags: ["idol", "EN"],
  },
  // ...
];
```

Add agencies the same way in `const AGENCIES`, then add events in `const EVENTS` and videos in `const VIDEOS`.

## 🎨 Customise the Look

All design tokens are CSS variables at the top of `index.html`:

```css
:root {
  --bg:      #0d0f1a;   /* page background */
  --accent:  #7c6af7;   /* primary purple */
  --accent2: #5be4c8;   /* teal (active/charts) */
  --accent3: #f765a8;   /* pink (events/compare) */
  /* ... */
}
```

Change `--accent` to any color and the whole UI follows.

## 📁 File Structure

```
vtuber-site/
├── index.html          ← entire site (HTML + CSS + JS in one file)
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml  ← GitHub Actions auto-deploy
```

## License

MIT — use freely, customise however you like.
