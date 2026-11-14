# KBuilt - Wear what you Built.

Pages: Home (full-screen video, We Are Bold and We are Built.), Our Story, The Drop (hats $38 / tees $32), Team Rentals & Services (facility photo background + inquiry form).

Cart + rentals inquiry work on static hosting via localStorage - no server needed.

## Run locally
npm install
npm run dev

## Deploy to GitHub Pages
1. Create a repo (e.g. kbuilt) and push this whole folder.
2. Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
3. The included .github/workflows/deploy.yml builds and deploys on push to main.
4. Visit https://<your-user>.github.io/kbuilt/

base is './' in vite.config.ts, so it works for project pages.

## Notes
- Total media ~1.8 MB: hero video is the 618 KB compressed version (360w, no audio, muted autoplay).
- To swap media, replace files in src/assets/ with the same filenames, then rebuild.
- Link preview: title KBuilt - Wear what you Built., image = logo in src/assets/logo_small.webp.
