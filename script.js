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

// ─── FALLBACK DATA (Instantly Loads) ──────────────────────
const fallbackTracks = [
  { id: "UxxajLWwzqY", title: "Jujutsu Kaisen - SPECIALZ", channel: "TOHO animation", thumb: "https://i.ytimg.com/vi/UxxajLWwzqY/maxresdefault.jpg" },
  { id: "S19UcWdOA-I", title: "METAMORPHOSIS (Sped Up)", channel: "INTERWORLD", thumb: "https://i.ytimg.com/vi/S19UcWdOA-I/maxresdefault.jpg" },
  { id: "w-sQRS-Lc9k", title: "Murder In My Mind", channel: "KORDHELL", thumb: "https://i.ytimg.com/vi/w-sQRS-Lc9k/maxresdefault.jpg" },
  { id: "60ItHLz5WEA", title: "Faded", channel: "Alan Walker", thumb: "https://i.ytimg.com/vi/60ItHLz5WEA/maxresdefault.jpg" },
  { id: "7aMOurgDB-o", title: "Tokyo Ghoul - Unravel", channel: "Anime Vibes", thumb: "https://i.ytimg.com/vi/7aMOurgDB-o/maxresdefault.jpg" }
];

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
      onReady: () => { 
        ytReady = true; 
        ytPlayer.setVolume(100); 
      },
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
  ytPlayer.setVolume(100); 
  
  updateNowPlaying(title, channel, thumb);
  isPlaying = true;
  updatePlayPauseBtn();
  checkIfFavorite();
}

function updateNowPlaying(title, channel, thumb) {
  document.getElementById("npTitle").textContent = title || "Unknown";
  document.getElementById("npArtist").textContent = channel || "Shinzi Music";
  const highResThumb = thumb || "https://i.ytimg.com/vi/default/hqdefault.jpg";
  document.getElementById("npThumb").innerHTML = `<img src="${highResThumb}" alt="thumb">`;

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
  document.getElementById("playIcon").classList.toggle("hidden", isPlaying);
  document.getElementById("pauseIcon").classList.toggle("hidden", !isPlaying);
  
  document.getElementById("innerPlayIcon").classList.toggle("hidden", isPlaying);
  document.getElementById("innerPauseIcon").classList.toggle("hidden", !isPlaying);
  
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

  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("currentTime").textContent = formatTime(current);
  document.getElementById("totalTime").textContent = formatTime(total);

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
    userFavorites.splice(existsIndex, 1);
  } else {
    userFavorites.push(track);
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
      document.getElementById("searchResults").innerHTML = "";
    }
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.add("hidden");
    searchInput.focus();
  });
}

window.showSection = function(name) {
  const sections = ["home", "search", "library"];
  sections.forEach(sec => {
    const el = document.getElementById(sec + "Section");
    if (el) el.classList.toggle("hidden", name !== sec);
  });

  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const navId = "nav" + name.charAt(0).toUpperCase() + name.slice(1);
  if (document.getElementById(navId)) document.getElementById(navId).classList.add("active");

  document.querySelectorAll(".mobile-nav-btn").forEach(el => el.classList.remove("active"));
  const mNavId = "mobileNav" + name.charAt(0).toUpperCase() + name.slice(1);
  if (document.getElementById(mNavId)) document.getElementById(mNavId).classList.add("active");
};

document.getElementById("navHome")?.addEventListener("click", () => showSection("home"));
document.getElementById("navSearch")?.addEventListener("click", () => { showSection("search"); searchInput.focus(); });
document.getElementById("navLibrary")?.addEventListener("click", () => showSection("library"));

// ─── API FETCH HELPER ─────────────────────────────────────
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
    
    // 🔥 HIGH-RES THUMBNAIL LOGIC
    currentQueue = items.map((item) => ({
      id: item.id.videoId, 
      title: item.snippet.title, 
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
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
  currentQueue = [...userFavorites]; 
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);
};

// ─── FAST AF OPTIMISTIC FEED LOADER ───────────────────────
function generateCardsHTML(containerId, tracks) {
  return tracks.map((track, i) => `
    <div class="music-card" onclick="playFeedTrack('${containerId}', ${i})">
      <img class="card-thumb" src="${track.thumb}" alt="" onerror="this.style.display='none'">
      <div class="card-title">${escHtml(track.title)}</div>
      <div class="card-sub">${escHtml(track.channel)}</div>
      <button class="card-play" onclick="event.stopPropagation();playFeedTrack('${containerId}',${i})">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  `).join("");
}

function loadFeed(query, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container._feedData = fallbackTracks;
  container.innerHTML = generateCardsHTML(containerId, fallbackTracks);

  fetchFromBackendProxy(query).then(data => {
    const items = data.items || [];
    if (items.length > 0) {
      // 🔥 HIGH-RES THUMBNAIL LOGIC
      container._feedData = items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumb: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      }));
      container.innerHTML = generateCardsHTML(containerId, container._feedData);
    }
  }).catch(err => {
    console.warn(`Render server asleep for ${containerId}, keeping local data on screen.`);
  });
}

window.playFeedTrack = function(containerId, index) {
  const container = document.getElementById(containerId);
  if (!container || !container._feedData) return;
  currentQueue = container._feedData;
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);
};

// Quick Card Clicks
document.querySelectorAll(".quick-card").forEach(card => {
  card.addEventListener("click", () => {
    const query = card.dataset.query;
    if (searchInput) searchInput.value = query;
    const searchClearBtn = document.getElementById("searchClear");
    if (searchClearBtn) searchClearBtn.classList.remove("hidden");
    showSection("search");
    searchYT(query);
  });
});

function escHtml(str) { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// ─── INSTANT INITIALIZATION ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const h = new Date().getHours();
  let g = "Good Evening";
  if (h < 12) g = "Good Morning";
  else if (h < 17) g = "Good Afternoon";
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) greetingEl.textContent = g;

  renderFavoritesList();
  loadYTApi();

  loadFeed("Top Hindi Songs", "madeForYou");
  loadFeed("Trending Music India", "trendingRow");
  loadFeed("Anime OST", "animeRow");
});
