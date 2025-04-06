import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BsClockHistory, BsTrash } from 'react-icons/bs';

function Sidebar({ userId, onSelectVideo }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/history/${userId}`);
        setHistory(res.data.videos);
      } catch (err) {
        console.error('Failed to fetch history:', err.message);
      }
    };

    fetchHistory();
  }, [userId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  return (
    <div className="bg-secondary p-3" style={{ width: '100%', maxWidth: '300px' }}>
      <h5 className="text-white mb-3">
        <BsClockHistory className="me-2" />
        Watch History
      </h5>

      {history.length === 0 ? (
        <p className="text-light">No videos watched yet.</p>
      ) : (
        <ul className="list-unstyled">
          {history.map((video) => (
            <li
              key={video._id}
              className="text-light mb-3 border-bottom pb-2"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectVideo(video.videoUrl)}
            >
              <small className="fw-bold">{video.videoUrl}</small><br />
              <small className="text-muted">{new Date(video.createdAt).toLocaleString()}</small><br />
              <button
                className="btn btn-sm btn-danger mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(video._id);
                }}
              >
                <BsTrash /> Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
