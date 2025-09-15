import React, { useState, useRef } from 'react';
import { Upload, Play, Clock, Image, FileVideo, CheckCircle, Loader2 } from 'lucide-react';
import './App.css';

const VideoMemeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await fetch('http://localhost:5050/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please check if the backend server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const jumpToTimestamp = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="main-title">
          AI Video Meme Analyzer
        </h1>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="file-upload-area">
            <label className="file-upload-label">
              <div className="file-upload-content">
                <Upload className="upload-icon" />
                <p className="upload-text">
                  <span className="upload-text-bold">Click to upload</span> or drag and drop
                </p>
                <p className="upload-subtext">MP4, AVI, MOV files supported</p>
              </div>
              <input
                type="file"
                className="file-input"
                accept="video/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="file-info">
              <div className="file-details">
                <FileVideo className="file-icon" />
                <span className="file-name">{selectedFile.name}</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`upload-button ${isUploading ? 'uploading' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="button-icon spinning" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="button-icon" />
                    Analyze Video
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Processing Complete */}
        {results && (
          <div className="success-message">
            <div className="success-content">
              <CheckCircle className="success-icon" />
              <span className="success-text">
                Processing completed! Found {results.suggestions.length} meme suggestions.
              </span>
            </div>
          </div>
        )}

        <div className="content-grid">
          {/* Video Player */}
          <div className="video-section">
            {videoUrl && (
              <div className="video-player-container">
                <h2 className="section-title">
                  <Play className="section-icon" />
                  Video Player
                </h2>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="video-player"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            )}

            {/* AI Suggestions Timeline */}
            {results && (
              <div className="suggestions-container">
                <h2 className="section-title">
                  <Clock className="section-icon" />
                  AI Suggestions
                </h2>
                <div className="suggestions-list">
                  {results.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => jumpToTimestamp(suggestion.timestamp)}
                      className="suggestion-item"
                    >
                      <div className="suggestion-content">
                        <div className="suggestion-left">
                          <div className="timestamp-badge">
                            {formatTime(suggestion.timestamp)}-{formatTime(suggestion.end_timestamp)}
                          </div>
                          <div className="suggestion-details">
                            <div className="meme-name">
                              {suggestion.meme_file.replace('.jpg', ' Meme')}
                            </div>
                            <div className="meme-description">
                              {suggestion.description}
                            </div>
                          </div>
                        </div>
                        <div className="suggestion-right">
                          <span className="confidence-score">
                            {Math.round(suggestion.confidence * 100)}% match
                          </span>
                          <img src={`/memes/${suggestion.meme_file}`} alt="suitable meme" width="128px" height="128px" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meme Library */}
          <div className="sidebar">
            <div className="meme-library">
              <h2 className="section-title">
                <Image className="section-icon" />
                Meme Library
              </h2>
              <div className="meme-list">
                {[
                  { name: "Success Kid", type: "happy", desc: "Excited reaction" },
                  { name: "Sad Cat", type: "sad", desc: "Disappointed reaction" },
                  { name: "Angry Baby", type: "angry", desc: "Frustrated reaction" },
                  { name: "Happy Dog", type: "happy", desc: "Joyful reaction" },
                  { name: "Confused Cat", type: "confused", desc: "Puzzled reaction" },
                  { name: "Satisfied Frog", type: "content", desc: "Content reaction" }
                ].map((meme, index) => (
                  <div key={index} className="meme-item">
                    <div className="meme-item-content">
                      <div className="meme-info">
                        <div className="meme-item-name">{meme.name}</div>
                        <div className="meme-item-desc">{meme.desc}</div>
                      </div>
                      <div className={`meme-type-badge ${meme.type}`}>
                        {meme.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results && (
                <div className="analysis-info">
                  <h3 className="analysis-title">Analysis Complete</h3>
                  <div className="analysis-details">
                    <div>File: {results.video_file}</div>
                    <div>Suggestions: {results.suggestions.length}</div>
                    <div>Processed: {new Date(results.processed_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMemeAnalyzer;