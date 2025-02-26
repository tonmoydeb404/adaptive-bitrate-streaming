import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

interface Video {
  name: string;
  path: string;
}

export default function VideoList() {
  const playerRef = useRef<ReactPlayer>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [levels, setLevels] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("auto");

  useEffect(() => {
    fetch(import.meta.env.VITE_APP_SERVER_URL + "/videos")
      .then((res) => res.json())
      .then((data: Video[]) => setVideos(data))
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  const onChangeBitrate = (value: string) => {
    const labelIndex = levels.findIndex((level) => level === value);

    const internalPlayer = playerRef.current?.getInternalPlayer("hls");
    if (internalPlayer) {
      // currentLevel expect to receive an index of the levels array
      internalPlayer.currentLevel = labelIndex;
    }

    if (labelIndex === -1) {
      setCurrentLevel("auto");
    } else {
      setCurrentLevel(value);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">HLS Video List</h1>
      <ul className="space-y-2">
        {videos.map((video) => (
          <li
            key={video.name}
            className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => {
              setLevels([]);
              setSelectedVideo(video.path);
            }}
          >
            {video.name}
          </li>
        ))}
      </ul>

      {selectedVideo && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Now Playing</h2>

          <select
            onChange={(e) => onChangeBitrate(e.target.value)}
            value={currentLevel}
          >
            <option value="auto">auto</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}p
              </option>
            ))}
          </select>

          <ReactPlayer
            url={selectedVideo}
            controls
            playing
            ref={playerRef}
            onReady={(player) => {
              const hls = player.getInternalPlayer("hls");
              if (hls) {
                setLevels(
                  hls.levels.map((level: { height: number }) =>
                    level.height.toString()
                  )
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
