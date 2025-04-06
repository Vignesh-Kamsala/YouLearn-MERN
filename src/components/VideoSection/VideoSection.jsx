import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './VideoSection.css';

function extractVideoId(url) {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function VideoSection() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);

  const features = [
    { icon: '▶️', title: 'Watch Videos', text: 'Paste any YouTube link and instantly start learning.' },
    { icon: '📄', title: 'Get Summaries', text: "Summarized content that's quick to grasp." },
    { icon: '💬', title: 'Ask Questions', text: 'Interact with our AI to clarify concepts.' },
  ];

  const handleLearnNow = async () => {
    const videoId = extractVideoId(youtubeUrl.trim());
    if (!videoId) {
      setError('Please enter a valid YouTube URL.');
      return;
    }

    setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
    setAiData(null);
    setError(null);
    setLoading(true);

    try {
      const transcriptRes = await fetch("http://localhost:3000/getTranscript", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: youtubeUrl }),
      });

      if (!transcriptRes.ok) throw new Error(`Server error: ${transcriptRes.status}`);
      const transcriptData = await transcriptRes.json();
      if (!transcriptData.success) throw new Error(transcriptData.message || 'Failed to get transcript');

      const transcriptText = transcriptData.transcript || '';
      console.log("📄 Transcript fetched:", transcriptText.slice(0, 200)); // optional debug

      const summaryRes = await fetch('http://localhost:3000/getSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      if (!summaryRes.ok) throw new Error(`Server error: ${summaryRes.status}`);
      const summaryData = await summaryRes.json();

      const keyPoints = summaryData.summary
        ? summaryData.summary.split('.').map(s => s.trim()).filter(Boolean).slice(0, 5)
        : [];

      setAiData({
        video_title: transcriptData.video_title || 'AI Generated Summary',
        transcript: transcriptText,
        summary: summaryData.summary || 'No summary available.',
        key_points: keyPoints,
      });
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to process video: ${err.message}`);
      setAiData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!aiData) return;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text(aiData.video_title || 'Video Summary', 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Summary:", 10, y);
    y += 8;
    const summaryLines = doc.splitTextToSize(aiData.summary, 180);
    doc.text(summaryLines, 10, y);
    y += summaryLines.length * 6 + 10;

    if (aiData.key_points?.length > 0) {
      doc.text("Key Points:", 10, y);
      y += 8;
      aiData.key_points.forEach(point => {
        const lines = doc.splitTextToSize(`• ${point}`, 180);
        if (y + lines.length * 6 > 270) {
          doc.addPage();
          y = 10;
        }
        doc.text(lines, 10, y);
        y += lines.length * 6;
      });
    }

    doc.addPage();
    doc.text("Transcript:", 10, 10);
    const transcriptLines = doc.splitTextToSize(aiData.transcript, 180);
    doc.text(transcriptLines, 10, 20);

    doc.save(`${aiData.video_title || 'summary'}.pdf`);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(aiData?.summary || '');
      alert("Summary copied to clipboard!");
    } catch {
      alert("Failed to copy summary.");
    }
  };

  const renderTabContent = () => {
    if (loading) return <div className="alert alert-info">Loading content...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!aiData) return <p className="text-muted">No data available. Paste a link to begin.</p>;

    switch (activeTab) {
      case 'summary':
        return (
          <>
            <h5>{aiData.video_title}</h5>
            <p>{aiData.summary}</p>
          </>
        );
      case 'keypoints':
        return aiData.key_points.length > 0 ? (
          <ul className="list-group">
            {aiData.key_points.map((point, index) => (
              <li key={index} className="list-group-item">{point}</li>
            ))}
          </ul>
        ) : (
          <p>No key points available.</p>
        );
      case 'transcript':
        return (
          <div className="transcript-container">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{aiData.transcript}</pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="video-section-container">
      <div className="main-content bg-light text-dark p-4">
        <h3 className="mb-3">Start learning with YouLearn</h3>
        <p>Paste a YouTube video link below</p>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Paste YouTube video URL here..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleLearnNow}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-stars me-1"></i> Learn Now
              </>
            )}
          </button>
        </div>

        {!embedUrl && !loading ? (
          <div className="d-flex flex-column flex-lg-row justify-content-around mt-5 gap-3">
            {features.map((f, idx) => (
              <div key={idx} className="card text-dark bg-light p-3 rounded shadow-sm flex-fill text-center">
                <div className="fs-1 mb-2">{f.icon}</div>
                <h5>{f.title}</h5>
                <p className="mb-0">{f.text}</p>
              </div>
            ))}
          </div>
        ) : (
          embedUrl && (
            <div className="video-content mt-5">
              <h4 className="mb-3 text-center">{aiData?.video_title || 'Video Overview'}</h4>

              <div className="ratio ratio-16x9 mb-4" style={{ maxWidth: '80%', margin: '0 auto' }}>
                <iframe
                  src={embedUrl}
                  title="YouTube Video"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="tabs bg-white p-3 rounded shadow-sm" style={{
                maxWidth: '80%',
                margin: '0 auto',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <div className="d-flex justify-content-center mb-3">
                  {['summary', 'keypoints', 'transcript'].map(tab => (
                    <button
                      key={tab}
                      className={`btn me-2 ${activeTab === tab ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {renderTabContent()}

                {aiData && (
                  <div className="text-end mt-4">
                    <button className="btn btn-outline-secondary me-2" onClick={handleDownloadPDF}>
                      Download PDF
                    </button>
                    <button className="btn btn-outline-info" onClick={handleCopySummary}>
                      Share Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default VideoSection;
