:root {
  --bg: #0c0c12;
  --bg2: #131322;
  --bg3: #1e1e38;
  --bg4: #2d2d4f;
  --accent: #9d4edd;
  --accent-hover: #b5179e;
  --text: #ffffff;
  --text2: #b3b3cc;
  --text3: #666680;
  --sidebar-w: 240px;
  --bar-h: 90px;
}

* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
  -webkit-tap-highlight-color: transparent; 
}
html, body { height: 100%; overflow: hidden; }
body { 
  background: var(--bg); 
  color: var(--text); 
  font-family: "Inter", sans-serif; 
  display: flex; 
  flex-direction: column; 
}

button, input { font: inherit; }
a { text-decoration: none; color: inherit; }
.hidden { display: none !important; }

/* ── LAYOUT ── */
.app-wrapper {
  display: flex;
  height: calc(100vh - var(--bar-h));
  overflow: hidden;
}

/* ── SIDEBAR ── */
.sidebar {
  width: var(--sidebar-w);
  background: #05050a;
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  gap: 24px;
  overflow-y: auto;
  flex-shrink: 0;
  height: calc(100vh - var(--bar-h));
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.03);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  margin-bottom: 8px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.logo-circle svg { width: 18px; height: 18px; }
.logo-text { font-size: 1.1rem; font-weight: 800; white-space: nowrap; letter-spacing: -0.5px; }
.logo-music { color: var(--accent); }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 8px;
  color: var(--text2);
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.15s, background 0.15s;
  cursor: pointer;
}
.nav-item svg { width: 22px; height: 22px; flex-shrink: 0; }
.nav-item:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.nav-item.active { color: var(--text); background: rgba(157, 78, 221, 0.15); }

.sidebar-section { padding: 0 12px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.add-btn {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}
.add-btn:hover { color: var(--text); }

.playlist-list { display: flex; flex-direction: column; gap: 8px; }
.playlist-item {
  font-size: 0.85rem;
  color: var(--text2);
  cursor: pointer;
  padding: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.playlist-item:hover { color: var(--text); }
.empty-text { font-size: 0.8rem; color: var(--text3); }

/* ── MAIN CONTENT ── */
.main-content {
  margin-left: var(--sidebar-w);
  height: calc(100vh - var(--bar-h));
  overflow-y: auto;
  flex: 1;
  background: linear-gradient(180deg, #18112c 0%, var(--bg) 40%);
  padding-bottom: 60px;
}

/* ── TOPBAR ── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(12, 12, 18, 0.75);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.02);
}

.nav-arrows { display: flex; gap: 8px; }
.arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  border: none;
  color: var(--text);
  cursor: pointer;
  display: grid;
  place-items: center;
}
.arrow-btn svg { width: 18px; height: 18px; }

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px 16px;
  max-width: 500px;
  transition: background 0.2s, border-color 0.2s;
}
.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(157, 78, 221, 0.5);
}
.search-bar svg { width: 18px; height: 18px; color: var(--text2); flex-shrink: 0; }
.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
}
.search-bar input::placeholder { color: var(--text3); }
.search-clear {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 1.2rem;
  cursor: pointer;
}

.topbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.topbar-btn {
  background: var(--text);
  color: #000;
  border: none;
  border-radius: 500px;
  padding: 8px 18px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.85rem;
}

/* ── SECTIONS ── */
.section { padding: 24px; }
.greeting { font-size: 2rem; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.5px; }

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 36px;
}
.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-size: 0.9rem;
  font-weight: 700;
  position: relative;
}
.quick-card:hover { 
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}
.quick-thumb {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  margin-top: 16px;
}
.section-title-row h2 { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.3px; }
.show-all { font-size: 0.8rem; font-weight: 700; color: var(--text2); }

.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* Hide scrollbar for the horizontal scroll rows */
.cards-row::-webkit-scrollbar { display: none; }
.cards-row { -ms-overflow-style: none; scrollbar-width: none; }

.music-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  position: relative;
}
.music-card:hover { 
  background: rgba(255, 255, 255, 0.06); 
  transform: translateY(-4px);
}
.card-thumb {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.card-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-sub { font-size: 0.8rem; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-play {
  position: absolute;
  bottom: 64px;
  right: 22px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.music-card:hover .card-play { opacity: 1; transform: translateY(0); }
.card-play:hover { background: var(--accent-hover); transform: scale(1.05) !important; }

.search-results-grid { display: flex; flex-direction: column; gap: 8px; }
.search-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.search-item:hover { background: rgba(255,255,255,0.05); }
.search-item.playing { background: rgba(157, 78, 221, 0.15); border-left: 3px solid var(--accent); }
.search-thumb { width: 52px; height: 52px; border-radius: 6px; object-fit: cover; }
.search-title { font-size: 0.95rem; font-weight: 600; color: #fff; }
.search-channel { font-size: 0.8rem; color: var(--text2); }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── NOW PLAYING CONTROL BAR ── */
.now-playing-bar {
  height: var(--bar-h);
  background: rgba(19, 19, 34, 0.85);
  backdrop-filter: blur(25px);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.np-left { display: flex; align-items: center; gap: 14px; width: 280px; flex-shrink: 0; }
.np-thumb { width: 56px; height: 56px; border-radius: 8px; background: var(--bg3); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.np-thumb img { width: 100%; height: 100%; object-fit: cover; }
.np-title { font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.np-artist { font-size: 0.8rem; color: var(--text2); margin-top: 2px; }

.np-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.np-controls { display: flex; align-items: center; gap: 20px; }
.ctrl-btn { background: none; border: none; color: var(--text2); cursor: pointer; display: grid; place-items: center; transition: color 0.15s; }
.ctrl-btn:hover { color: #fff; }
.ctrl-btn.active { color: var(--accent); }

.play-pause-btn { width: 40px; height: 40px; border-radius: 50%; background: #fff; color: #000 !important; }
.play-pause-btn svg { width: 20px; height: 20px; }

.np-progress { display: flex; align-items: center; gap: 12px; width: 100%; max-width: 540px; }
.time { font-size: 0.75rem; color: var(--text3); font-variant-numeric: tabular-nums; }
.progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer; position: relative; }
.progress-fill { height: 100%; background: var(--text2); border-radius: 2px; width: 0%; }
.progress-thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: #fff; opacity: 0; }
.progress-bar:hover .progress-fill { background: var(--accent); }
.progress-bar:hover .progress-thumb { opacity: 1; }

.np-right { display: flex; align-items: center; gap: 12px; width: 200px; justify-content: flex-end; flex-shrink: 0; }
.volume-slider { width: 100px; accent-color: var(--accent); cursor: pointer; height: 4px; }

/* ── STUNNING REFACTORED MOBILE INTERFACE (SPOTIFY STYLE) ── */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; padding-bottom: 180px; }
  
  .topbar {
    padding: 16px;
    background: rgba(12, 12, 18, 0.9);
  }
  .search-bar { max-width: 100%; }

  .greeting { font-size: 1.6rem; padding-left: 4px; }
  .quick-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .quick-thumb { width: 52px; height: 52px; font-size: 1.2rem; }
  
  /* THE FIX: Horizontal scroll for music rows on mobile */
  .cards-row { 
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .music-card { 
    flex: 0 0 130px; /* Forces cards to be small and neat */
    scroll-snap-align: start;
    padding: 10px; 
    border-radius: 10px; 
  }
  .card-title { font-size: 0.85rem; }

  /* Premium Floating Mobile Audio Dock */
  .now-playing-bar {
    bottom: 16px;
    left: 12px;
    right: 12px;
    height: 64px;
    border-radius: 12px;
    background: rgba(25, 20, 40, 0.9);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    padding: 0 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .np-left { width: 70%; }
  .np-thumb { width: 44px; height: 44px; border-radius: 6px; }
  .np-info { min-width: 0; }
  .np-title { font-size: 0.85rem; }
  
  .np-right, .np-progress, .ctrl-btn[title="Shuffle"], .ctrl-btn[title="Repeat"], .ctrl-btn[title="Previous"] { 
    display: none !important; 
  }
  
  .np-center { flex: none; width: auto; }
  .np-controls { gap: 12px; }
  .play-pause-btn { width: 36px; height: 36px; }
}

@media (max-width: 480px) {
  .section { padding: 14px; }
  .quick-grid { gap: 8px; }
  .quick-card { font-size: 0.8rem; gap: 10px; }
}
