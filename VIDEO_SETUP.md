# Video Camera Feeds Setup

## Overview
The dashboard now supports playing local video files for each camera feed. Each zone has been mapped to its corresponding video file.

## Video Files
The following video files are now available in the camera feeds:

- **Zone 1 (O Building)**: `zone1.mp4`
- **Zone 2 (Olive)**: `zone2.mp4` 
- **Zone 3 (O'S Link)**: `zone3.mp4`
- **Zone 4 (S Building Amphitheatre)**: `zone4.mp4`

## How to Use

1. **Access Camera Feeds**: Navigate to the Dashboard and click on the "Camera Feeds" tab
2. **Select a Camera**: Click on any camera card to open the video player modal
3. **Video Controls**: 
   - **Play/Pause**: Control video playback
   - **Restart**: Reset video to beginning
   - **Fullscreen**: Toggle fullscreen mode
   - **Volume**: Adjust video volume (0-100%)
   - **Native Controls**: Use the built-in video player controls

## Features

- ✅ **Auto-play**: Videos start playing automatically when opened
- ✅ **Loop**: Videos loop continuously
- ✅ **Muted by default**: Videos start muted for better user experience
- ✅ **Error handling**: Shows error messages if video fails to load
- ✅ **Loading states**: Shows loading spinner while video loads
- ✅ **Responsive**: Video player adapts to different screen sizes
- ✅ **Fullscreen support**: Fullscreen mode for better viewing

## File Requirements

- **Format**: MP4 files
- **Location**: Files should be in the `public/` folder
- **Naming**: Files should be named `zone1.mp4`, `zone2.mp4`, `zone3.mp4`, `zone4.mp4`
- **Size**: Large video files are supported (20MB+)

## Troubleshooting

### Video Not Loading
1. Check if the video file exists in the `public/` folder
2. Ensure the file name matches exactly (case-sensitive)
3. Check browser console for any error messages
4. Try refreshing the page

### Video Not Playing
1. Check if the video file is corrupted
2. Ensure the video format is MP4
3. Try a different browser
4. Check if autoplay is blocked by browser settings

### Performance Issues
1. Large video files may take time to load
2. Consider compressing videos for better performance
3. Ensure stable internet connection for initial load

## Development Notes

- Videos are served from the `public/` folder by the development server
- Video paths are relative to the public folder (e.g., `/zone1.mp4`)
- The video player uses HTML5 `<video>` element with fallback support
- All video controls are disabled when there's an error loading the video 