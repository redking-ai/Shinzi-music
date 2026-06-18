const BACKEND_SEARCH_URL = "https://shinzi-proxy.onrender.com/music/search";

// ─── STATE ────────────────────────────────────────────────
let ytPlayer = null;
let ytReady = false;
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let progressInterval = null;

// ─── FAVORITES DATABASE ───────────────────────────────────
let userFavorites = JSON.parse(localStorage.getItem('shinzi_favorites')) || [];

function saveFavorites() {
  localStorage.setItem('shinzi_favorites', JSON.stringify(userFavorites));
  renderFavoritesList();
}

function renderFavoritesList() {
  const container = document.getElementById("favoritesList");
  if (!container) return;
  
  if (userFavorites.length === 0) {
    container.innerHTML = `<div class="status-msg-box">No favorites yet. Tap the heart to save songs!</div>`;
    return;
  }
  
  container.innerHTML = userFavorites.map((track, i) => `
    <div class="search-item" onclick="playFromFavorites(${i})">
      <img class="search-thumb" src="${track.thumb}" alt="">
      <div class="search-info">
        <div class="search-title">${escHtml(track.title)}</div>
        <div class="search-channel">${escHtml(track.channel)}</div>
      </div>
    </div>
  `).join("");
}

// ─── YOUTUBE IFRAME API ───────────────────────────────────
function loadYTApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("ytPlayer", {
    height: "1", width: "1",
    playerVars: { autoplay: 0, controls: 0 },
    events: {
      onReady: () => { ytReady = true; },
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayPauseBtn();
    startProgressUpdate();
  } else if (e.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    updatePlayPauseBtn();
    stopProgressUpdate();
  } else if (e.data === YT.PlayerState.ENDED) {
    if (isRepeat) { ytPlayer.seekTo(0); ytPlayer.playVideo(); } 
    else { playNext(); }
  }
}

// ─── PLAY LOGIC ───────────────────────────────────────────
function playVideo(videoId, title, channel, thumb) {
  if (!ytReady) { alert("Player loading, try again in a few seconds!"); return; }
  ytPlayer.loadVideoById(videoId);
  updateNowPlaying(title, channel, thumb);
  isPlaying = true;
  updatePlayPauseBtn();
  checkIfFavorite(); // Update heart icon
}

function updateNowPlaying(title, channel, thumb) {
  // Update Bottom Bar
  document.getElementById("npTitle").textContent = title || "Unknown";
  document.getElementById("npArtist").textContent = channel || "Shinzi Music";
  const highResThumb = thumb || "https://i.ytimg.com/vi/default/hqdefault.jpg";
  document.getElementById("npThumb").innerHTML = `<img src="${highResThumb}" alt="thumb">`;

  // Update Inner Screen
  document.getElementById("innerTitle").textContent = title || "Unknown";
  document.getElementById("innerArtist").textContent = channel || "Shinzi Music";
  document.getElementById("innerThumbImg").src = highResThumb;

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || "Unknown Track",
      artist: channel || "Shinzi Music",
      album: "Shinzi Premium",
      artwork: [{ src: highResThumb, sizes: '512x512', type: 'image/jpeg' }]
    });
    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
  }
}

function togglePlayPause() {
  if (!ytReady || currentIndex === -1) return;
  if (isPlaying) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
}

function updatePlayPauseBtn() {
  // Bottom Bar
  document.getElementById("playIcon").classList.toggle("hidden", isPlaying);
  document.getElementById("pauseIcon").classList.toggle("hidden", !isPlaying);
  
  // Inner Screen
  document.getElementById("innerPlayIcon").classList.toggle("hidden", isPlaying);
  document.getElementById("innerPauseIcon").classList.toggle("hidden", !isPlaying);
  
  // Mobile Mini
  const mobilePlay = document.getElementById("mobilePlayBtn");
  if(mobilePlay) {
    mobilePlay.innerHTML = isPlaying 
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>` 
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  }
}

// ─── CONTROLS WIRING ──────────────────────────────────────
document.getElementById("btnPlayPause").addEventListener("click", (e) => { e.stopPropagation(); togglePlayPause(); });
document.getElementById("innerPlayBtn").addEventListener("click", togglePlayPause);
document.getElementById("mobilePlayBtn")?.addEventListener("click", (e) => { e.stopPropagation(); togglePlayPause(); });

document.getElementById("btnNext").addEventListener("click", (e) => { e.stopPropagation(); playNext(); });
document.getElementById("innerNext").addEventListener("click", playNext);

document.getElementById("btnPrev").addEventListener("click", (e) => { e.stopPropagation(); playPrev(); });
document.getElementById("innerPrev").addEventListener("click", playPrev);

function playNext() {
  if (currentQueue.length === 0) return;
  currentIndex = isShuffle ? Math.floor(Math.random() * currentQueue.length) : (currentIndex + 1) % currentQueue.length;
  const track = currentQueue[currentIndex];
  playVideo(track.id, track.title, track.channel, track.thumb);
}

function playPrev() {
  if (currentQueue.length === 0) return;
  currentIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
  const track = currentQueue[currentIndex];
  playVideo(track.id, track.title, track.channel, track.thumb);
}

// ─── PROGRESS BAR SYNC ────────────────────────────────────
function startProgressUpdate() {
  stopProgressUpdate();
  progressInterval = setInterval(updateProgress, 500);
}
function stopProgressUpdate() { if (progressInterval) clearInterval(progressInterval); }

function updateProgress() {
  if (!ytReady || !ytPlayer.getCurrentTime) return;
  const current = ytPlayer.getCurrentTime() || 0;
  const total = ytPlayer.getDuration() || 0;
  const pct = total > 0 ? (current / total) * 100 : 0;

  // Bottom Bar Sync
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("currentTime").textContent = formatTime(current);
  document.getElementById("totalTime").textContent = formatTime(total);

  // Inner Screen Sync
  document.getElementById("innerProgressFill").style.width = pct + "%";
  document.getElementById("innerCurrentTime").textContent = formatTime(current);
  document.getElementById("innerTotalTime").textContent = formatTime(total);
}

document.getElementById("progressBar").addEventListener("click", seekAudio);
document.getElementById("innerProgressBar").addEventListener("click", seekAudio);

function seekAudio(e) {
  if (!ytReady) return;
  const bar = e.currentTarget;
  const pct = e.offsetX / bar.offsetWidth;
  const total = ytPlayer.getDuration() || 0;
  ytPlayer.seekTo(pct * total, true);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── HEART & FAVORITE WIRING ──────────────────────────────
function toggleFavoriteAction(e) {
  e.stopPropagation();
  if (currentIndex === -1) return;
  
  const track = currentQueue[currentIndex];
  const existsIndex = userFavorites.findIndex(t => t.id === track.id);
  
  if (existsIndex > -1) {
    userFavorites.splice(existsIndex, 1); // Remove it
  } else {
    userFavorites.push(track); // Add it
  }
  
  saveFavorites();
  checkIfFavorite();
}

function checkIfFavorite() {
  if (currentIndex === -1) return;
  const track = currentQueue[currentIndex];
  const isFav = userFavorites.some(t => t.id === track.id);
  
  document.getElementById("npHeart").classList.toggle("liked", isFav);
  document.getElementById("innerHeart").classList.toggle("liked", isFav);
}

document.getElementById("npHeart").addEventListener("click", toggleFavoriteAction);
document.getElementById("innerHeart").addEventListener("click", toggleFavoriteAction);

// ─── INNER SCREEN SLIDE LOGIC ─────────────────────────────
document.getElementById("mainPlayerBar").addEventListener("click", () => {
    document.getElementById("innerPlayerScreen").classList.add("active");
});
document.getElementById("closeInnerScreen").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("innerPlayerScreen").classList.remove("active");
});

// ─── SEARCH & UI LOGIC ────────────────────────────────────
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
let searchTimeout = null;

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    searchClear.classList.toggle("hidden", !q);
    clearTimeout(searchTimeout);
    if (q.length > 1) {
      showSection("search");
      searchTimeout = setTimeout(() => searchYT(q), 500);
    } else if (!q) {
      // FIX 1: Don't jump back to home. Just clear results.
      document.getElementById("searchResults").innerHTML = "";
    }
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.add("hidden");
    searchInput.focus(); // FIX 1: Keeps keyboard open on mobile
  });
}

window.showSection = function(name) {
  const sections = ["home", "search", "library"];
  sections.forEach(sec => {
    const el = document.getElementById(sec + "Section");
    if (el) el.classList.toggle("hidden", name !== sec);
  });

  // Desktop active nav
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const navId = "nav" + name.charAt(0).toUpperCase() + name.slice(1);
  if (document.getElementById(navId)) document.getElementById(navId).classList.add("active");

  // Mobile active nav
  document.querySelectorAll(".mobile-nav-btn").forEach(el => el.classList.remove("active"));
  const mNavId = "mobileNav" + name.charAt(0).toUpperCase() + name.slice(1);
  if (document.getElementById(mNavId)) document.getElementById(mNavId).classList.add("active");
};

// Nav clicks
document.getElementById("navHome")?.addEventListener("click", () => showSection("home"));
document.getElementById("navSearch")?.addEventListener("click", () => { showSection("search"); searchInput.focus(); });
document.getElementById("navLibrary")?.addEventListener("click", () => showSection("library"));

// ─── FETCH & PLAY TRIGGERS ────────────────────────────────
async function fetchFromBackendProxy(query) {
  const optimizedQuery = query + " official audio";
  const url = `${BACKEND_SEARCH_URL}?q=${encodeURIComponent(optimizedQuery)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Backend error");
  return await res.json();
}

async function searchYT(query) {
  const loading = document.getElementById("searchLoading");
  const results = document.getElementById("searchResults");
  if (loading) loading.classList.remove("hidden");
  if (results) results.innerHTML = "";

  try {
    const data = await fetchFromBackendProxy(query);
    const items = data.items || [];
    currentQueue = items.map((item) => ({
      id: item.id.videoId, title: item.snippet.title, channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    }));

    if (results) {
      results.innerHTML = currentQueue.map((track, i) => `
        <div class="search-item" onclick="playFromQueue(${i})">
          <img class="search-thumb" src="${track.thumb}" alt="">
          <div class="search-info"><div class="search-title">${escHtml(track.title)}</div><div class="search-channel">${escHtml(track.channel)}</div></div>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Search failed");
  } finally {
    if (loading) loading.classList.add("hidden");
  }
}

window.playFromQueue = function(index) {
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);
};

window.playFromFavorites = function(index) {
  currentQueue = [...userFavorites]; // Load favorites into active queue
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);
};

// ─── INITIALIZATION ───────────────────────────────────────
function escHtml(str) { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

document.addEventListener("DOMContentLoaded", () => {
  renderFavoritesList();
  loadYTApi();
  
  // (You can still load your feed functions here like before, omitted for brevity)
});
