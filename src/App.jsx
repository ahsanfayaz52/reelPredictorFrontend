import { useState } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!file && !caption.trim()) {
      setError("Please select a video file and enter a caption.");
      return;
    }
    
    if (!file) {
      setError("Please select a video file.");
      return;
    }
  
    if (!caption.trim()) {
      setError("Please enter a caption.");
      return;
    }
  
    setLoading(true);
    setError(null);
    setResult(null);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
  
    try {
      const res = await fetch("https://reelpredictorbackend.onrender.com/upload-reel/", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Analysis failed");
      }
  
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  const getViralBadgeClass = (chance) => {
    if (!chance) return "bg-secondary text-white";
    if (chance.includes("High")) return "bg-success text-white";
    if (chance.includes("Medium")) return "bg-warning text-dark";
    return "bg-danger text-white";
  };

  const getScoreColor = (score) => {
    if (!score) return "bg-secondary";
    if (score >= 80) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark">
          Reel <span className="text-primary">Viral Predictor</span>
        </h1>
        <p className="lead text-muted">
          Get AI-powered insights to maximize your Reel's reach and engagement
        </p>
      </div>

      {/* Upload Form */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Analyze Your Reel</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            {/* File Upload */}
            <div className="mb-4">
  <label htmlFor="fileInput" className="form-label fw-semibold">
    Select Reel Video
  </label>
  <div className="custom-file-upload">
    <input
      type="file"
      id="fileInput"
      accept="video/*"
      onChange={(e) => setFile(e.target.files[0])}
      required
    />
    <div className="upload-text">
      {file ? "Change file" : "Click or drag to upload video"}
    </div>
    {file && <div className="file-name">{file.name}</div>}
  </div>
  <div className="form-text">MP4, MOV up to 100MB</div>
</div>


            {/* Caption Input */}
            <div className="mb-4">
              <label htmlFor="captionInput" className="form-label fw-semibold">
                Current Caption
              </label>
              <textarea
                className="form-control"
                id="captionInput"
                rows={4}
                placeholder="Paste your current caption here..."
                value={caption}
                required
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Analyzing...
                </>
              ) : (
                "Get Viral Analysis"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mb-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="card-title mb-2">Analysis Results</h3>
              <p className="text-muted mb-4">
                <strong>{result.filename}</strong> &bull;{" "}
                {result.duration_seconds?.toFixed(1) || "N/A"} seconds
              </p>

              <div className="row g-3">
                <div className="col-md-6">
                  <h6>Viral Score </h6>
                  <span
                    className={`badge py-2 px-3 fs-6 ${getScoreColor(
                      result.viral_score
                    )}`}
                  >
                    {result.viral_score ?? "N/A"}/100
                  </span>
                </div>
                <div className="col-md-6">
                  <h6>Viral Chance </h6>
                  <span
                    className={`badge py-2 px-3 fs-6 ${getViralBadgeClass(
                      result.viral_chance
                    )}`}
                  >
                    {result.viral_chance || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Caption Analysis */}
          <div className="row g-4 mb-4">
            {/* Current Caption */}
            <div className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-dark text-white">
                  Current Caption Analysis
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Caption Score: </span>
                      <span>{result.current_caption_score ?? 0}%</span>
                    </div>
                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${result.current_caption_score ?? 0}%` }}
                        aria-valuenow={result.current_caption_score ?? 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  <div className="alert alert-info small mb-0" role="alert">
                    {result.caption_feedback || "No feedback available for this caption."}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Captions */}
            <div className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-success text-white">
                  Suggested Viral Captions
                </div>
                <div className="card-body">
                  {result.suggested_captions?.map((caption, index) => (
                    <div
                      key={index}
                      className="mb-3 p-3 bg-light border-start border-4 border-success rounded"
                    >
                      <div className="d-flex align-items-start">
                        <span className="badge bg-success me-3 fs-6">{index + 1}</span>
                        <p className="mb-0">{caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hashtag Strategy */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-warning text-dark">
              Hashtag Strategy
            </div>
            <div className="card-body">
              <div className="row text-center">
                {/* Broad Reach */}
                <div className="col-md-4 mb-3">
                  <h5 className="text-warning fw-semibold">Broad Reach</h5>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {result.hashtag_strategy?.broad?.map((tag, idx) => (
                      <span
                        key={`broad-${idx}`}
                        className="badge bg-white text-warning px-3 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medium Reach */}
                <div className="col-md-4 mb-3">
                  <h5 className="text-orange fw-semibold" style={{color:'#FF7F50'}}>
                    Medium Reach
                  </h5>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {result.hashtag_strategy?.medium?.map((tag, idx) => (
                      <span
                        key={`medium-${idx}`}
                        className="badge bg-white text-orange px-3 py-1"
                        style={{color:'#FF7F50'}}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Niche Specific */}
                <div className="col-md-4 mb-3">
                  <h5 className="text-danger fw-semibold">Niche Specific</h5>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {result.hashtag_strategy?.niche?.map((tag, idx) => (
                      <span
                        key={`niche-${idx}`}
                        className="badge bg-white text-danger px-3 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Viral Potential & Pro Tips */}
          <div className="row g-4 mb-4">
            {/* Viral Potential */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-purple text-white" style={{backgroundColor:'#6f42c1'}}>
                  Viral Potential
                </div>
                <div className="card-body">
                  <ul className="list-unstyled">
                    {result.viral_reasons?.map((reason, idx) => (
                      <li key={idx} className="d-flex align-items-start mb-2">
                        <span className="badge bg-purple me-2" style={{backgroundColor:'#d6bcfa', color:'#6f42c1'}}>
                          ✓
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-danger text-white">
                  Pro Tips
                </div>
                <div className="card-body">
                  <ol className="ps-3">
                    {result.pro_tips?.map((tip, idx) => (
                      <li key={idx} className="mb-2">
                        {tip}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Optimal Posting Times */}
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              Optimal Posting Times
            </div>
            <div className="card-body">
              <div className="row g-3">
                {result.optimal_post_times?.map((time, idx) => (
                  <div key={idx} className="col-md-4">
                    <div className="bg-light rounded p-3 text-center">
                      <h6 className="text-info">Option {idx + 1}</h6>
                      <p className="fw-bold mb-0">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {result.algorithm_insights && (
                <div className="alert alert-info mt-4" role="alert">
                  <strong>Algorithm Insights:</strong> {result.algorithm_insights}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
