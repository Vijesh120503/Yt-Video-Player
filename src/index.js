import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ReactPlayer from "react-player";
import "./styles.css";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [query, setQuery] = useState("Tamil Songs");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const cache = {};

  const apiKeys = [


  ].filter(Boolean);    //add as much as api keys here to avoid quota issues

  const searchVideos = async (index = 0) => {
    if (query in cache) {
      setSearchResults(cache[query]);
      return;
    }

    if (index >= apiKeys.length) {
      console.error("All API quotas exceeded");
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const apiKey = apiKeys[index];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API key failed");

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
        cache[query] = data.items;
        setLoading(false);
      } else {
        searchVideos(index + 1);
      }
    } catch (error) {
      searchVideos(index + 1);
    }
  };

  useEffect(() => {
    searchVideos();
  }, []);

  const handleVideoSelect = (videoId) => {
    setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
  };

  return (
    <div className="App">
      <header>
        <h1>Shadow Videos</h1>
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a video..."
          />
          <button onClick={() => searchVideos(0)}>Search</button>
        </div>
      </header>

      {loading && <div className="loader"></div>}

      {videoUrl && (
        <div className="player-container">
          <ReactPlayer url={videoUrl} controls width="100%" />
        </div>
      )}

      <div className="video-list">
        {searchResults.length > 0 ? (
          searchResults.map((result) => {
            const { videoId } = result.id;
            const { title, thumbnails, publishedAt } = result.snippet;
            const formattedDate = new Date(publishedAt).toDateString();

            return (
              <div key={videoId} className="video-item" onClick={() => handleVideoSelect(videoId)}>
                <img src={thumbnails.medium.url} alt={title} className="video-thumbnail" />
                <h3>{title}</h3>
                <p className="video-date"> {formattedDate}</p>
              </div>
            );
          })
        ) : (
          !loading && <p className="no-results">No videos found. Please try another search.</p>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
