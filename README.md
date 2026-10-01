# BahaiZoom

BahaiZoom is a global online community platform for the Baháʼí Faith, providing a centralized hub for prayers, Zoom meetings, educational programs, speakers, and spiritual resources. The platform supports multiple languages including English, Persian (Farsi), and Arabic.

## Features

- **Multilingual Support**: Full internationalization with RTL support for Arabic and Persian
- **Prayer Center**: Daily prayers, devotional gatherings, and prayer resources
- **Zoom Meeting Integration**: Upcoming meetings, recurring sessions, and direct join links
- **Event Management**: Community events, conferences, and special programs
- **Speaker Directory**: Featured speakers and hosts with profiles
- **Media Library**: Audio, video, and educational content
- **Weekly Schedule**: Interactive calendar view of community activities
- **Admin Dashboard**: Content management system (CMS) for managing meetings, speakers, prayers, and site settings
- **User Authentication**: Role-based access with admin and user permissions
- **World Clock**: Timezone-aware scheduling for global community coordination
- **Command Palette**: Quick navigation and search functionality

## Tech Stack

- **Frontend**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) via `@google/genai`
- **Server**: [Express.js](https://expressjs.com/) for API endpoints
- **Fonts**: Inter, Plus Jakarta Sans, Cinzel, Amiri, Vazirmatn (for multilingual support)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or equivalent package manager
- [Google Gemini API Key](https://aistudio.google.com/apikey) (for AI-powered features)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PaarsahJam/bahai-zoom.git
cd bahai-zoom
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory (or use your environment configuration):

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

> **Note**: In AI Studio environments, these may be automatically injected via secrets.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 with host binding |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run clean` | Remove build artifacts (`dist/`, `server.js`) |
| `npm run lint` | Run TypeScript type checking (`tsc --noEmit`) |

## Project Structure

```text
bahai-zoom/
├── src/
│   ├── components/         # React components
│   │   ├── admin/          # Admin CMS components
│   │   └── ...            # Public-facing components
│   ├── data/              # Translations, mock data, configs
│   ├── utils/             # Utility functions (calendar, auth, CMS, etc.)
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── .env.example           # Example environment variables
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── metadata.json          # App metadata
```

## Key Features in Detail

### Content Management
The admin dashboard allows authorized users to manage:
- Meetings and Zoom links
- Speakers and hosts
- Prayer collections
- Media library content
- Community events
- Site settings and branding
- User accounts and permissions
- Audit logs

### Internationalization
- Supports English (`en`), Persian/Farsi (`fa`), and Arabic (`ar`)
- Automatic text direction switching (LTR/RTL) based on language
- Localized dates including Persian (Jalali) calendar support
- Custom font families for each language

### Accessibility & UX
- Responsive design for mobile, tablet, and desktop
- Dark/light theme considerations with warm, welcoming palette
- Smooth animations and transitions
- Command palette for keyboard navigation
- Accessible component structure

## Contributing

Contributions are welcome! If you'd like to contribute to BahaiZoom:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is intended for the Baháʼí community. Please respect the spiritual nature and guidelines of the Faith when contributing.

## Acknowledgments

- Built with care for the global Baháʼí community
- Inspired by the principle of unity and the oneness of humanity
- Special thanks to all contributors and community members

---

For questions, issues, or suggestions, please [open an issue](https://github.com/PaarsahJam/bahai-zoom/issues).