# Shop signage — one web address, every screen

A tiny static site that turns any browser into a digital sign. Screens just open one
URL; the page plays a playlist of pictures and videos, changing every 10 seconds
(configurable), and picks up new content automatically.

No server, no build step, no CMS. GitHub Pages hosts it for free.

```
 index.html      the player  -> this is the URL the screens open
 admin.html      the editor  -> where staff add pictures and press Save
 playlist.json   the content list (auto-written by admin.html)
 media/          uploaded pictures and videos
```

---

## 1. Publish it (once, ~5 minutes)

1. Create a **public** repository on GitHub, for example `shop-signage`.
2. Upload the contents of this folder to the **root** of that repository
   (GitHub → *Add file → Upload files*, then drag `index.html`, `admin.html`,
   `playlist.json`, `media/` and `.nojekyll`).
   * If Windows hides `.nojekyll`, use *Add file → Create new file* and create it
     with any content — it just needs to exist so GitHub Pages skips Jekyll.
3. Repository → **Settings → Pages** → *Build and deployment*:
   **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/ (root)`** → Save.
4. Wait 1–2 minutes. Your site is at:

   ```
   https://YOUR-USERNAME.github.io/shop-signage/
   ```

   The player is `…/index.html`, the editor is `…/admin.html`.

> Free GitHub Pages requires a **public** repository — anyone with the link can see
> your pictures. Don't put confidential material on it. If that matters, see
> [Private content](#private-content).

---

## 2. Add content (the easy front end)

Open `https://YOUR-USERNAME.github.io/shop-signage/admin.html` on a phone or laptop.

1. **Connect**: username, repo name, branch (`main`) and a fine-grained token.
   The page explains how to create the token — it needs only
   **Contents: Read and write** for this one repository.
   The token is saved in that browser only; it is never committed.
2. **Add pictures or videos** — tap the box, pick files (JPG/PNG/MP4). They upload
   and appear in the list in seconds.
3. **Order** them with ↑ ↓, set a custom duration per slide if you want, then
   **Save playlist**.
4. Screens refresh automatically within about a minute (GitHub Pages caching can add
   a few minutes the first time).

Token on a shared PC? Use *Forget this device* when you're done, or revoke the token
in GitHub settings at any time.

### File tips

| | Recommended |
|---|---|
| Pictures | 1920 × 1080 px, JPG, quality ~80, **under 500 KB** |
| Videos | H.264 MP4, 1080p, **under 50 MB**, short (5–15 s) |
| Portrait screens | export 1080 × 1920 and pick *Fill the screen* or *Fit entire picture* |

Large files are the most common cause of sluggish screens. Keep the whole playlist
under ~20 MB if you can.

---

## 3. Point Philips Wave at the URL

Wave's menus vary by display model and firmware, but the pattern is always one of:

- **Add content → Web page / URL / Web app**, paste the player address; or
- set the display's **built-in browser homepage / start URL** to the player address; or
- in the display's Android settings, install nothing — just open the browser to that
  URL and enable **auto‑launch on power on**.

Use the exact `https://…/index.html` address. Then:

- Turn **off** sleep/auto‑off timers on the display.
- Enable **auto‑launch / kiosk** so the browser returns after a reboot.
- Prefer **wired Ethernet** or 5 GHz Wi‑Fi. Signage that drops off Wi‑Fi looks
  exactly like a frozen player.

The address to copy is shown at the bottom of `admin.html` (section 4).

---

## 4. Why this is more reliable than pushing content

Your screens freeze when Wave *pushes* new content. This setup removes that step
entirely: the screen pulls one small JSON file plus images, like any web page.

Extra safety built into the player:

- **Preloading** — all images are fetched ahead of time, so a slow network doesn't
  stall a transition.
- **Playlist polling** — checks for new content every 60 s and updates without a
  reboot or a page reload.
- **Self-healing watchdog** — if the browser freezes (timers stop for 12 s while the
  tab is visible), the page reloads itself automatically.
- **Nightly reload** — full refresh at 04:00 by default (configurable).
- **Automatic retry** — if the network or playlist is unavailable, it shows a clear
  message and retries every 15 s instead of sitting on a black screen.
- **Bad-file skipping** — a corrupt or missing image is skipped rather than blocking
  the whole playlist.
- **Wake lock** — asks the browser to keep the screen awake (where supported).

None of this can fix a display that has actually crashed at the OS level, but it does
remove the usual "screen is stuck on an old poster until someone walks over with a
USB stick" failure.

### If a screen still freezes

1. Confirm the same URL works in Chrome on a phone or laptop on the shop Wi‑Fi.
2. On the display: clear the browser cache, or reboot the display once.
3. Update the display firmware / Wave app.
4. Factory-reset the display only as a last resort, then set the URL again.
5. Try the URL with `?debug=1` in a corner of the screen — that small bar shows the
   current slide, file count and uptime, which makes "is it frozen?" obvious.

---

## 5. Advanced (all optional)

| What | How |
|---|---|
| Different content per shop | Create `playlist-shop2.json` (the editor's *Playlist file* menu can create one) and open `…/index.html?screen=shop2` on that screen |
| Test status bar | `…/index.html?debug=1` |
| Reload every 30 min | `…/index.html?reload=30` |
| Full-screen test locally | Open `index.html` in Chrome, press `F11`; ←/→ keys move slides, `R` reloads |
| Show a clock | Editor → *Playback settings* → Show clock |
| Change nightly reload time | Editor → *Playback settings* |
| Replace files in place instead of new uploads | Add `"cacheBust": true` to `settings` in `playlist.json` |

`playlist.json` is plain text and can be edited by hand:

```json
{
  "version": "1",
  "settings": { "defaultDuration": 10, "fit": "contain", "showClock": false },
  "items": [
    { "src": "media/offer.jpg", "duration": 10 },
    { "src": "media/video.mp4", "type": "video", "duration": 15 },
    { "src": "media/logo.png" }
  ]
}
```

`duration` is optional (falls back to `defaultDuration`). For videos, omit `duration`
to play the whole clip.

---

## 6. Limits and alternatives

GitHub Pages (free) is fine for a handful of shops:

- Public repository, ~1 GB repo, **~100 GB/month** soft bandwidth limit.
- Because each screen caches images and only re-downloads when you add content, the
  real traffic is small — unless you post large videos to many screens daily.
- GitHub's API allows 5,000 requests/hour per token; the editor uses a handful.

If you outgrow it — many screens, large video, or you need the media private —
the same files deploy unchanged to **Cloudflare Pages** (free, private repos
supported, generous bandwidth) or Netlify. Nothing is GitHub-specific except the
admin page's upload API.

### Private content

The free GitHub Pages route is public. For private media, host the same folder on
Cloudflare Pages connected to a private repo; then either keep editing on GitHub
(`playlist.json`) or point `admin.html` at the GitHub API of that private repo —
the player itself only needs the public site URL.

---

## Local preview

```bash
npx serve .
# then open http://localhost:3000
```

`admin.html` needs to be served over HTTP (not opened as a file) for uploads and
thumbnails to behave normally.
