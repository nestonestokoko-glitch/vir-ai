# VIR AI - Text Motion Reel Maker

A simple web-based tool that converts user-entered English text into a short-form animated typography video.

## Features

- Enter English text and convert it to animated typography reels
- Select fonts, styles, and animations
- Live preview of animations
- Timeline editing for precise control
- Export as MP4 video (up to 60 seconds)
- Vertical 9:16 format optimized for Instagram Reels, YouTube Shorts, and TikTok

## Tech Stack

- **Frontend**: Next.js 15+, React 19+, TypeScript 5+
- **Styling**: Tailwind CSS
- **Video Rendering**: Remotion (simulated in MVP)
- **State Management**: React state + Zustand (planned)
- **Backend**: Supabase (planned for future versions)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   └── editor/
│       ├── page.tsx      # Main editor interface
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utility functions
���������������└── api/
    └── render/           # API routes for video rendering
```

## Components

- `TextEditor`: Multiline text input
- `FontSelector`: Font and weight selection
- `StyleSelector`: Typography style selection
- `AnimationSelector`: Animation preset selection
- `PreviewCanvas`: Video preview with playback controls
- `Timeline`: Segment-based timeline editor
- `ExportButton`: Render and export functionality

## MVP Features Implemented

������������������������������✅ Text input with validation  
������������������������������✅ Font selection (Inter, Roboto, Poppins, etc.)  
������������������������������✅ Style selection (Modern, Bold, Cinematic, etc.)  
������������������������������✅ Animation selection (Fade, Slide, Scale, Typewriter, etc.)  
������������������������������✅ Duration control (1-60 seconds)  
������������������������������✅ Live preview with play/pause  
������������������������������✅ Timeline with segment editing  
������������������������������✅ Export simulation  
������������������������������✅ Responsive design  
������������������������������✅ Local storage persistence  

## Future Enhancements

- Actual video rendering with Remotion
- Supabase integration for project storage
- User authentication
- More animation presets
- Advanced text segmentation
- Audio track support
- Template library
- Social media export presets

## License

MIT