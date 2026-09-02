import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const videosDir = path.resolve('app/tests/videos');

if (fs.existsSync(videosDir)) {
  const entries = fs.readdirSync(videosDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(videosDir, entry.name);
      const videoFile = path.join(subDir, 'video.webm');
      if (fs.existsSync(videoFile)) {
        let cleanName = entry.name;
        if (cleanName.includes('start-screen')) {
          cleanName = 'initial_start_screen';
        } else if (cleanName.includes('end-screen')) {
          cleanName = 'game_lifecycle';
        } else if (cleanName.includes('settings')) {
          cleanName = 'game_settings';
        }
        
        const webmPath = path.join(videosDir, `${cleanName}.webm`);
        const gifPath = path.join(videosDir, `${cleanName}.gif`);
        
        fs.copyFileSync(videoFile, webmPath);
        console.log(`Copied ${videoFile} -> ${webmPath}`);

        try {
          execSync(`ffmpeg -y -i "${webmPath}" -vf "fps=15,scale=600:-1:flags=lanczos" "${gifPath}"`, { stdio: 'ignore' });
          console.log(`Converted ${webmPath} -> ${gifPath}`);
        } catch (e) {
          console.warn(`ffmpeg conversion skipped/failed for ${cleanName}:`, e.message);
        }
      }
    }
  }
}
