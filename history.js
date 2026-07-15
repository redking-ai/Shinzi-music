// 1. This is your "dummy" data. Later, this will pull from Firebase!
const playedSongs = [
    { title: "Sweet Debris Theme", artist: "Shinzi", icon: "🎶" },
    { title: "Midnight Drift", artist: "Red King", icon: "🎧" },
    { title: "City Lights", artist: "Shinzi", icon: "📻" }
];

// 2. Find the empty box in your HTML
const historyContainer = document.getElementById("history-list");

// 3. The Function: Build the HTML automatically
function loadPlayHistory() {
    // Clear out anything that might be in the box first
    historyContainer.innerHTML = ""; 

    // Loop through every single song in our list above
    playedSongs.forEach(song => {
        
        // Write the HTML structure for the song
        const songBlock = `
            <div class="history-item">
                <div class="album-art">${song.icon}</div>
                <div class="song-info">
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist}</span>
                </div>
            </div>
        `;
        
        // Shove that structure directly into the HTML page
        historyContainer.innerHTML += songBlock;
    });
}

// 4. Run the function the second the page opens
window.onload = loadPlayHistory;

