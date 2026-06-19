const BACKEND_SEARCH_URL = "https://shinzi-proxy.onrender.com/music/search";

// ─── STATE ────────────────────────────────────────────────
let ytPlayer = null;
let ytReady = false;
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;
let progressInterval = null;

// ─── INSTANT LOCAL CACHE (Fixes Blank Home Screen) ────────
const initialDataForYou = [
  { id: "M0nSj1teGz8", title: "Aarambh Hai Prachand", channel: "Piyush Mishra", thumb: "https://i.ytimg.com/vi/M0nSj1teGz8/hqdefault.jpg" },
  { id: "S19UcWdOA-I", title: "METAMORPHOSIS (Sped Up)", channel: "INTERWORLD", thumb: "https://i.ytimg.com/vi/S19UcWdOA-I/hqdefault.jpg" },
  { id: "cb1XkE2xT0A", title: "Arjan Vailly", channel: "Bhupinder Babbal", thumb: "https://i.ytimg.com/vi/cb1XkE2xT0A/hqdefault.jpg" }
];

const initialDataTrending = [
  { id: "lz157kuOMC8", title: "Live Another Day", channel: "KORDHELL", thumb: "https://i.ytimg.com/vi/lz157kuOMC8/hqdefault.jpg" },
  { id: "60ItHLz5WEA", title: "Faded", channel: "Alan Walker", thumb: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg" },
  { id: "w-sQRS-Lc9k", title: "Murder In My Mind", channel: "KORDHELL", thumb: "https://i.ytimg.com/vi/w-sQRS-Lc9k/hqdefault.jpg" }
];

const initialDataAnime = [
  { id: "UxxajLWwzqY", title: "SPECIALZ (Jujutsu Kaisen)", channel: "King Gnu", thumb: "https://i.ytimg.com/vi/UxxajLWwzqY/hqdefault.jpg" },
  { id: "7aMOurgDB-o", title: "Unravel (Tokyo Ghoul)", channel: "TK", thumb: "https://i.ytimg.com/vi/7aMOurgDB-o/hqdefault.jpg" },
  { id: "Gq3jIqG8aMo", title: "Kick Back (Chainsaw Man)", channel: "Kenshi Yonezu", thumb: "https://i.ytimg.com/vi/Gq3jIqG8aMo/hqdefault.jpg" }
];

// ─── FAVORITES DATABASE ───────────────────────────────────
let userFavorites = JSON.parse(localStorage.getItem('shinzi_favorites')) || [];

function renderFavoritesList() {
  const container = document.getElementById("favoritesList");
  if (!container) return;
  if (userFavorites.length === 0) {
    container.innerHTML = `<div style="color:#a7a7a7; padding: 20px;">No favorites yet.</div>`;
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
      onReady: () => { ytReady = true; ytPlayer.setVolume(100); },
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    isPlaying = true; updatePlayPauseBtn(); startProgressUpdate();
  } else if (e.data === YT.PlayerState.PAUSED) {
    isPlaying = false; updatePlayPauseBtn(); stopProgressUpdate();
  } else if (e.data === YT.PlayerState.ENDED) {
    playNext();
  }
}

// ─── PLAY LOGIC ───────────────────────────────────────────
function playVideo(videoId, title, channel, thumb) {
  if (!ytReady) { alert("Player loading, try again in 2 seconds!"); return; }
  ytPlayer.loadVideoById(videoId);
  updateNowPlaying(title, channel, thumb);
  isPlaying = true;
  updatePlayPauseBtn();
}

function updateNowPlaying(title, channel, thumb) {
  document.getElementById("npTitle").textContent = title || "Unknown";
  document.getElementById("npArtist").textContent = channel || "Shinzi Music";
  const highResThumb = thumb || "https://i.ytimg.com/vi/default/hqdefault.jpg";
  document.getElementById("npThumb").innerHTML = `<img src="${highResThumb}" alt="thumb">`;
}

function togglePlayPause() {
  if (!ytReady || currentIndex === -1) return;
  if (isPlaying) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
}

function updatePlayPauseBtn() {
  document.getElementById("playIcon").classList.toggle("hidden", isPlaying);
  document.getElementById("pauseIcon").classList.toggle("hidden", !isPlaying);
  const mobilePlay = document.getElementById("mobilePlayBtn");
  if(mobilePlay) {
    mobilePlay.innerHTML = isPlaying 
      ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>` 
      : `<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>`;
  }
}

document.getElementById("btnPlayPause").addEventListener("click", (e) => { e.stopPropagation(); togglePlayPause(); });
document.getElementById("mobilePlayBtn")?.addEventListener("click", (e) => { e.stopPropagation(); togglePlayPause(); });
document.getElementById("btnNext").addEventListener("click", (e) => { e.stopPropagation(); playNext(); });
document.getElementById("btnPrev").addEventListener("click", (e) => { e.stopPropagation(); playPrev(); });

function playNext() {
  if (currentQueue.length === 0) return;
  currentIndex = (currentIndex + 1) % currentQueue.length;
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
function startProgressUpdate() { stopProgressUpdate(); progressInterval = setInterval(updateProgress, 500); }
function stopProgressUpdate() { if (progressInterval) clearInterval(progressInterval); }

function updateProgress() {
  if (!ytReady || !ytPlayer.getCurrentTime) return;
  const current = ytPlayer.getCurrentTime() || 0;
  const total = ytPlayer.getDuration() || 0;
  const pct = total > 0 ? (current / total) * 100 : 0;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("currentTime").textContent = formatTime(current);
  document.getElementById("totalTime").textContent = formatTime(total);
}

document.getElementById("progressBar").addEventListener("click", function(e) {
  if (!ytReady) return;
  const pct = e.offsetX / this.offsetWidth;
  const total = ytPlayer.getDuration() || 0;
  ytPlayer.seekTo(pct * total, true);
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── SEARCH & UI LOGIC ────────────────────────────────────
const searchInput = document.getElementById("searchInput");
let searchTimeout = null;

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    clearTimeout(searchTimeout);
    if (q.length > 1) {
      searchTimeout = setTimeout(() => searchYT(q), 500);
    } else if (!q) {
      document.getElementById("searchResults").innerHTML = "";
    }
  });
}

window.showSection = function(name) {
  ["home", "search", "library"].forEach(sec => {
    document.getElementById(sec + "Section").classList.toggle("hidden", name !== sec);
  });
  document.querySelectorAll(".nav-item, .mobile-nav-btn").forEach(el => el.classList.remove("active"));
  document.getElementById("nav" + name.charAt(0).toUpperCase() + name.slice(1))?.classList.add("active");
  document.getElementById("mobileNav" + name.charAt(0).toUpperCase() + name.slice(1))?.classList.add("active");
};

async function searchYT(query) {
  const results = document.getElementById("searchResults");
  results.innerHTML = `<div style="color:#a7a7a7; padding: 20px;">Searching tracks...</div>`;

  try {
    const res = await fetch(`${BACKEND_SEARCH_URL}?q=${encodeURIComponent(query + " official audio")}`);
    const data = await res.json();
    const items = data.items || [];

    currentQueue = items.map((item) => ({
      id: item.id.videoId, 
      title: item.snippet.title, 
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
    }));

    if (currentQueue.length === 0) {
      results.innerHTML = `<div style="color:#a7a7a7; padding: 20px;">No results found.</div>`;
    } else {
      results.innerHTML = currentQueue.map((track, i) => `
        <div class="search-item" onclick="playFromQueue(${i})">
          <img class="search-thumb" src="${track.thumb}" alt="">
          <div class="search-info">
              <div class="search-title">${escHtml(track.title)}</div>
              <div class="search-channel">${escHtml(track.channel)}</div>
          </div>
        </div>
      `).join("");
    }
  } catch (err) {
    results.innerHTML = `<div style="color: #ff4444; padding: 20px;">Connection failed. Try again.</div>`;
  }
}

window.playFromQueue = function(index) {
  currentIndex = index;
  playVideo(currentQueue[index].id, currentQueue[index].title, currentQueue[index].channel, currentQueue[index].thumb);
};

// ─── INSTANT RENDER UI FUNCTION ────────────────────────────
function generateCardsHTML(tracks, queueName) {
  return tracks.map((track, i) => `
    <div class="music-card" onclick="playStatic('${queueName}', ${i})">
      <img class="card-thumb" src="${track.thumb}" alt="">
      <div class="card-title">${escHtml(track.title)}</div>
      <div class="card-sub">${escHtml(track.channel)}</div>
      <button class="card-play" onclick="event.stopPropagation(); playStatic('${queueName}', ${i})">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  `).join("");
}

// Logic to play the hardcoded home screen arrays
window.playStatic = function(queueName, index) {
  if (queueName === 'madeForYou') currentQueue = initialDataForYou;
  if (queueName === 'trendingRow') currentQueue = initialDataTrending;
  if (queueName === 'animeRow') currentQueue = initialDataAnime;
  currentIndex = index;
  playVideo(currentQueue[index].id, currentQueue[index].title, currentQueue[index].channel, currentQueue[index].thumb);
}

function escHtml(str) { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// ─── INITIALIZATION ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const h = new Date().getHours();
  document.getElementById("greeting").textContent = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  // INSTANTLY render home screen rows. Zero delay.
  document.getElementById("madeForYou").innerHTML = generateCardsHTML(initialDataForYou, 'madeForYou');
  document.getElementById("trendingRow").innerHTML = generateCardsHTML(initialDataTrending, 'trendingRow');
  document.getElementById("animeRow").innerHTML = generateCardsHTML(initialDataAnime, 'animeRow');

  renderFavoritesList();
  loadYTApi();
});
