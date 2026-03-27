# Portfolio Website

A high-performance personal portfolio and blog built with **VitePress**, **Vue 3**, and **TypeScript**. This project features a custom-themed documentation-style layout repurposed as a creative hub for projects, music, and technical writing.

## 🚀 Features

* **Custom ASCII Animations:** Frame-based ASCII art rendering for unique visual flair.
* **Dynamic Data:** Project and song listings driven by localized JSON data.
* **Technical Blog:** Deep dives into programming topics (e.g., UTF-8 console issues).
* **Interactive Components:** Built-in YouTube embeds, contact modals, and gradient backgrounds.
* **Code Quality:** Strictly typed with TypeScript, formatted with Prettier, and protected by pre-commit hooks.

## 📂 Project Structure

```text
├── .vitepress/          # VitePress configuration & theme customization
├── src/
│   ├── blog/            # Markdown files for technical articles
│   ├── components/      # Vue components (Pages & UI elements)
│   ├── data/            # JSON files for projects, songs, and site stats
│   ├── public/          # Static assets including ASCII animation frames
│   ├── projects/        # Detailed project category pages
│   └── utils/           # Shared TypeScript helpers (audio, etc.)
├── .pre-commit-config.yaml # Automated linting/formatting checks
└── package.json         # Project dependencies and scripts
```

## 🛠️ Development

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **pnpm**

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm run docs:dev
```

### Build & Deployment
```bash
# Build the static site
npm run docs:build

# Preview the production build locally
npm run docs:preview
```

## 🎨 Customization

### Adding a New Blog Post
Create a new `.md` file in `src/blog/` or a sub-folder. VitePress will automatically handle the routing based on the file name.

### Updating Projects/Data
Modify the JSON files located in `src/data/`. The `ProjectsPage.vue` and `MusicPage.vue` components reactively render content based on these files:
* `projects/games.json`
* `site/projects.json`

### ASCII Animations
New animations can be added by placing `.txt` frames in `src/public/ascii/[name]/frames/` and updating the `AsciiAnimation.vue` component props.

## 🔧 Tech Stack

* **Framework:** [VitePress](https://vitepress.dev/)
* **UI:** [Vue 3](https://vuejs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** CSS Variables (Custom Theme)
* **Linting:** Prettier & Commitizen (`.cz.toml`)

## 📄 License

Licensed under the **MIT License**. See [LICENSE.txt](LICENSE.txt) for details.

## 🔗 Support

* YouTube: [https://www.youtube.com/@mrrobinofficial](https://www.youtube.com/@mrrobinofficial)
* Email: [mrrobin123mail@gmail.com](mailto:mrrobin123mail@gmail.com)
* Twitter/X: [https://twitter.com/MrRobinOfficial](https://twitter.com/MrRobinOfficial)
