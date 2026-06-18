// ─── CONFIG ───────────────────────────────────────────────
const BACKEND_SEARCH_URL = "https://shinzi-proxy.onrender.com/music/search";
const MAX_RESULTS = 20;

// ─── STATE ────────────────────────────────────────────────
let ytPlayer = null;
let ytReady = false;
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let progressInterval = null;

// ─── YOUTUBE IFRAME API (For Playback) ────────────────────
function loadYTApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
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
    if (isRepeat) {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    } else {
      playNext();
    }
  }
}

// ─── PLAY ─────────────────────────────────────────────────
function playVideo(videoId, title, channel, thumb) {
  if (!ytReady) { alert("Player loading, try again in a few seconds!"); return; }
  ytPlayer.loadVideoById(videoId);
  updateNowPlaying(title, channel, thumb);
  isPlaying = true;
  updatePlayPauseBtn();
}

// ─── MEDIA SESSION API (Background Lockscreen Controls) ───
function updateNowPlaying(title, channel, thumb) {
  document.getElementById("npTitle").textContent = title || "Unknown";
  document.getElementById("npArtist").textContent = channel || "Shinzi Music";
  const npThumb = document.getElementById("npThumb");
  
  const highResThumb = thumb || "https://i.ytimg.com/vi/default/hqdefault.jpg";
  
  if (thumb) {
    npThumb.innerHTML = `<img src="${thumb}" alt="thumb">`;
  } else {
    npThumb.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
  }

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || "Unknown Track",
      artist: channel || "Shinzi Music",
      album: "Shinzi Premium",
      artwork: [
        { src: highResThumb, sizes: '96x96', type: 'image/jpeg' },
        { src: highResThumb, sizes: '256x256', type: 'image/jpeg' },
        { src: highResThumb, sizes: '512x512', type: 'image/jpeg' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => { ytPlayer.playVideo(); navigator.mediaSession.playbackState = "playing"; });
    navigator.mediaSession.setActionHandler('pause', () => { ytPlayer.pauseVideo(); navigator.mediaSession.playbackState = "paused"; });
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
  }
}

function updatePlayPauseBtn() {
  const playIcon = document.getElementById("playIcon");
  const pauseIcon = document.getElementById("pauseIcon");
  if (isPlaying) {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
  } else {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
  }
}

// ─── CONTROLS ─────────────────────────────────────────────
document.getElementById("btnPlayPause").addEventListener("click", () => {
  if (!ytReady || currentIndex === -1) return;
  if (isPlaying) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
});

document.getElementById("btnNext").addEventListener("click", playNext);
document.getElementById("btnPrev").addEventListener("click", playPrev);

document.getElementById("btnShuffle").addEventListener("click", () => {
  isShuffle = !isShuffle;
  document.getElementById("btnShuffle").classList.toggle("active", isShuffle);
});

document.getElementById("btnRepeat").addEventListener("click", () => {
  isRepeat = !isRepeat;
  document.getElementById("btnRepeat").classList.toggle("active", isRepeat);
});

document.getElementById("volumeSlider").addEventListener("input", (e) => {
  if (ytReady) ytPlayer.setVolume(e.target.value);
});

function playNext() {
  if (currentQueue.length === 0) return;
  if (isShuffle) currentIndex = Math.floor(Math.random() * currentQueue.length);
  else currentIndex = (currentIndex + 1) % currentQueue.length;
  const track = currentQueue[currentIndex];
  playVideo(track.id, track.title, track.channel, track.thumb);
}

function playPrev() {
  if (currentQueue.length === 0) return;
  currentIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
  const track = currentQueue[currentIndex];
  playVideo(track.id, track.title, track.channel, track.thumb);
}

// ─── PROGRESS ─────────────────────────────────────────────
function startProgressUpdate() {
  stopProgressUpdate();
  progressInterval = setInterval(updateProgress, 500);
}

// Global scope attachment to handle programmatic injection calls safely
window.playFromQueue = function(index) {
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);

  document.querySelectorAll(".search-item").forEach((el, i) => {
    el.classList.toggle("playing", i === index);
  });
};

window.playFeedTrack = function(containerId, index) {
  const container = document.getElementById(containerId);
  if (!container || !container._feedData) return;
  currentQueue = container._feedData;
  currentIndex = index;
  const track = currentQueue[index];
  playVideo(track.id, track.title, track.channel, track.thumb);
};

window.showSection = function(name) {
  const home = document.getElementById("homeSection");
  const search = document.getElementById("searchSection");
  if (home) home.classList.toggle("hidden", name !== "home");
  if (search) search.classList.toggle("hidden", name !== "search");
  if (name === "home") setActiveNav("navHome");
};

function stopProgressUpdate() {
  if (progressInterval) clearInterval(progressInterval);
}

function updateProgress() {
  if (!ytReady || !ytPlayer.getCurrentTime) return;
  const current = ytPlayer.getCurrentTime() || 0;
  const total = ytPlayer.getDuration() || 0;
  const pct = total > 0 ? (current / total) * 100 : 0;

  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressThumb").style.left = pct + "%";
  document.getElementById("currentTime").textContent = formatTime(current);
  document.getElementById("totalTime").textContent = formatTime(total);
}

document.getElementById("progressBar").addEventListener("click", (e) => {
  if (!ytReady) return;
  const bar = e.currentTarget;
  const pct = e.offsetX / bar.offsetWidth;
  const total = ytPlayer.getDuration() || 0;
  ytPlayer.seekTo(pct * total, true);
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── FALLBACK LOCAL DATA ──────────────────────────────────
const fallbackTracks = [
  { id: "UxxajLWwzqY", title: "Jujutsu Kaisen - SPECIALZ", channel: "TOHO animation", thumb: "https://i.ytimg.com/vi/UxxajLWwzqY/hqdefault.jpg" },
  { id: "S19UcWdOA-I", title: "METAMORPHOSIS (Sped Up)", channel: "INTERWORLD", thumb: "https://i.ytimg.com/vi/S19UcWdOA-I/hqdefault.jpg" },
  { id: "w-sQRS-Lc9k", title: "Murder In My Mind", channel: "KORDHELL", thumb: "https://i.ytimg.com/vi/w-sQRS-Lc9k/hqdefault.jpg" },
  { id: "60ItHLz5WEA", title: "Faded", channel: "Alan Walker", thumb: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg" },
  { id: "7aMOurgDB-o", title: "Tokyo Ghoul - Unravel", channel: "Anime Vibes", thumb: "https://i.ytimg.com/vi/7aMOurgDB-o/hqdefault.jpg" }
];

// ─── SECURE PROXY FETCH HELPER (AD-REDUCTION TRICK) ───────
async function fetchFromBackendProxy(query) {
  const optimizedQuery = query + " official audio";
  const url = `${BACKEND_SEARCH_URL}?q=${encodeURIComponent(optimizedQuery)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Backend connection error");
  return await res.json();
}

// ─── SEARCH SYSTEM ────────────────────────────────────────
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
      showSection("home");
    }
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.add("hidden");
    showSection("home");
  });
}

document.getElementById("navSearch")?.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("search");
  searchInput.focus();
  setActiveNav("navSearch");
});

document.getElementById("navHome")?.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("home");
  searchInput.value = "";
  if (searchClear) searchClear.classList.add("hidden");
  setActiveNav("navHome");
});

async function searchYT(query) {
  const loading = document.getElementById("searchLoading");
  const results = document.getElementById("searchResults");
  const empty = document.getElementById("searchEmpty");

  if (loading) loading.classList.remove("hidden");
  if (results) results.innerHTML = "";
  if (empty) empty.classList.add("hidden");

  try {
    const data = await fetchFromBackendProxy(query);
    const items = data.items || [];

    if (items.length === 0) throw new Error("No results found.");

    currentQueue = items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    }));

    if (results) {
      results.innerHTML = currentQueue.map((track, i) => `
        <div class="search-item" data-index="${i}" onclick="playFromQueue(${i})">
          <img class="search-thumb" src="${track.thumb}" alt="" onerror="this.style.background='#333';this.src=''">
          <div class="search-info">
            <div class="search-title">${escHtml(track.title)}</div>
            <div class="search-channel">${escHtml(track.channel)}</div>
          </div>
        </div>
      `).join("");
    }

  } catch (err) {
    if (empty) {
      empty.classList.remove("hidden");
      const p = empty.querySelector("p");
      if (p) p.textContent = err.message === "No results found." 
        ? "No songs found for that search!" 
        : "Shinzi Proxy is waking up. Please try searching again in a few seconds!";
    }
  } finally {
    if (loading) loading.classList.add("hidden");
  }
}

// ─── HOMEPAGE FEED LOADER ─────────────────────────────────
async function loadFeed(query, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const data = await fetchFromBackendProxy(query);
    const items = data.items || [];
    if (items.length === 0) throw new Error("No items");

    container._feedData = items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    }));

  } catch (err) {
    console.warn(`Feed ${containerId} failed, falling back to local matrix...`);
    container._feedData = fallbackTracks;
  }

  container.innerHTML = container._feedData.map((track, i) => `
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

document.querySelectorAll(".quick-card").forEach(card => {
  card.addEventListener("click", () => {
    const query = card.dataset.query;
    if (searchInput) searchInput.value = query;
    if (searchClear) searchClear.classList.remove("hidden");
    showSection("search");
    searchYT(query);
    setActiveNav("navSearch");
  });
});

function setActiveNav(id) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const nav = document.getElementById(id);
  if (nav) nav.classList.add("active");
  
  const mNav = document.getElementById("mobile" + id.charAt(0).toUpperCase() + id.slice(1));
  if (mNav) {
    document.querySelectorAll(".mobile-nav-btn").forEach(el => el.classList.remove("active"));
    mNav.classList.add("active");
  }
}

function setGreeting() {
  const h = new Date().getHours();
  let g = "Good Evening";
  if (h < 12) g = "Good Morning";
  else if (h < 17) g = "Good Afternoon";
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) greetingEl.textContent = g;
}

document.getElementById("npHeart")?.addEventListener("click", function () {
  this.classList.toggle("liked");
});

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── SAFE STARTUP & INCOGNITO FIX (WATCHDOG TIMER) ────────
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Shinzi Music Ecosystem...");

  let isLoaded = false;
  
  const loadingTimeout = setTimeout(() => {
    if (!isLoaded) {
      const searchEmpty = document.getElementById("searchEmpty");
      if (searchEmpty) {
        searchEmpty.classList.remove("hidden");
        const p = searchEmpty.querySelector("p");
        if (p) p.textContent = "Waking up Shinzi Servers... This takes up to 50 seconds on first load.";
      }
    }
  }, 4000);

  try {
    setGreeting();
    loadYTApi();

    await Promise.all([
      loadFeed("Top Hindi Songs", "madeForYou"),
      loadFeed("Trending Music India", "trendingRow"),
      loadFeed("Phonk Music", "phonkRow"),
      loadFeed("Anime OST", "animeRow")
    ]);

    isLoaded = true;
    clearTimeout(loadingTimeout);

  } catch (fatalCrash) {
    isLoaded = true;
    clearTimeout(loadingTimeout);
    console.error("Critical block caught! Overriding browser restrictions.", fatalCrash);
    
    const mfy = document.getElementById("madeForYou");
    if (mfy) {
      mfy._feedData = fallbackTracks;
      mfy.innerHTML = fallbackTracks.map((track, i) => `
        <div class="music-card" onclick="playFeedTrack('madeForYou', ${i})">
          <img class="card-thumb" src="${track.thumb}" alt="">
          <div class="card-title">${escHtml(track.title)}</div>
          <div class="card-sub">${escHtml(track.channel)}</div>
        </div>
      `).join("");
    }
  }
});
