# Sakshi Pawar — Personal Developer Portfolio

A light-first, responsive portfolio made with semantic HTML, CSS, and vanilla JavaScript.

## Files
- `index.html` — page structure and portfolio content
- `style.css` — responsive styling, light/dark themes, animations and project artwork
- `script.js` — mobile menu, theme toggle, project detail modals and contact settings
- `assets/` — place your resume PDF here

## Before publishing
1. Open `script.js` and set `PORTFOLIO_CONFIG.email` to your real professional email. Leave it blank if you don't want to publish one yet.
2. Put your current resume PDF in `assets/` and name it `Sakshi_Pawar_Resume.pdf`. Do not publish a resume containing private information you do not want public.
3. Check both repository links in `index.html` and `script.js` open the correct public repositories.
4. Review project descriptions and only claim features/technologies you actually implemented.
5. If any skill is still at beginner level, be ready to explain your current understanding honestly in interviews.

## Run locally
No build step is needed:
1. Extract the ZIP.
2. Open `index.html` in your browser.
3. For a local server, open the folder in VS Code and use the Live Server extension, or run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Deploy to GitHub Pages
1. Create a public GitHub repository named `sakshi-portfolio` (or another name you prefer).
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder to the repository root. Do not upload private company data or confidential files.
3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Wait for the Pages deployment to finish. GitHub will show the live URL on the Pages settings screen.
6. Open the live URL on a phone and desktop and test every link, the menu, theme switch and project dialogs.

## Deploy to Netlify (alternative)
1. Sign in to Netlify and choose **Add new site → Deploy manually**.
2. Drag the extracted portfolio folder into the deploy area, or connect the GitHub repository.
3. Netlify will publish the static website and provide a live URL.
4. Test the published site and update it by redeploying or pushing repository changes.

## Notes
- The portfolio is static: no backend or contact form is configured.
- The email control copies the email address you set in `script.js`; if clipboard access is unavailable it opens the default email app.
- The resume link only works once the PDF is added to `assets/`.
- This portfolio does not claim to be deployed yet. Deployment happens when you complete one of the steps above.
