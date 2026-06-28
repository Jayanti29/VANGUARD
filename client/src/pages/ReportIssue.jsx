import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import { 
  Camera, 
  Mic, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Play, 
  Pause,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useLocation from '../hooks/useLocation';
import useIssues from '../hooks/useIssues';
import { analyzeIssueImage } from '../lib/gemini';
import { downloadPdfReport } from '../lib/pdfGenerator';
import LoadingShield from '../components/ui/LoadingShield';
import AIResultCard from '../components/ui/AIResultCard';

// Leaflet click handler component
function MapEvents({ onChangeCoords }) {
  useMapEvents({
    click(e) {
      onChangeCoords(e.latlng);
    }
  });
  return null;
}

// Leaflet auto-recenter component
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function ReportIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const { location, setLocation, detectLocation, reverseGeocode } = useLocation();
  const { reportIssue } = useIssues();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Photo
  const [photo, setPhoto] = useState(null); // base64 string
  const fileInputRef = useRef(null);

  // Step 2: Voice Note
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef(null);

  // Step 3: Text Description
  const [description, setDescription] = useState('');

  // Step 4: Map Pin adjustment
  const [adjustCoords, setAdjustCoords] = useState({ lat: location.lat, lng: location.lng });
  const [resolvedAddress, setResolvedAddress] = useState(location.address);

  // AI Pipeline output state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Detect location on load or step transition
  useEffect(() => {
    if (step === 4) {
      detectLocation().then(loc => {
        setAdjustCoords({ lat: loc.lat, lng: loc.lng });
        setResolvedAddress(loc.address);
      }).catch(err => {
        console.warn("Unable to auto-detect coords:", err);
      });
    }
  }, [step]);

  // Setup Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = localStorage.getItem('vanguard_language') === 'hi' ? 'hi-IN' : 'en-IN';
      
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscription(text);
        setDescription(prev => prev ? `${prev}. ${text}` : text);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Image Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Voice Recording Logic
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setVoiceBlob(audioBlob);
        setVoiceUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {}
      }
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Click handler to adjust coordinates directly on Leaflet map
  const handleMapClick = async (latlng) => {
    const newCoords = { lat: latlng.lat, lng: latlng.lng };
    setAdjustCoords(newCoords);
    
    try {
      const geo = await reverseGeocode(newCoords.lat, newCoords.lng);
      setResolvedAddress(geo.address);
      setLocation({ ...location, ...newCoords, ...geo });
    } catch (e) {
      console.warn("Unable to reverse geocode map click:", e);
    }
  };

  // Slider adjustments
  const handleCoordShift = async (axis, val) => {
    const shift = parseFloat(val);
    const newCoords = { ...adjustCoords, [axis]: shift };
    setAdjustCoords(newCoords);
    
    try {
      const geo = await reverseGeocode(newCoords.lat, newCoords.lng);
      setResolvedAddress(geo.address);
      setLocation({ ...location, ...newCoords, ...geo });
    } catch (e) {
      console.warn("Unable to reverse geocode coordinate shift:", e);
    }
  };

  // AI Pipeline Execution Trigger
  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setStep(5);

    try {
      const language = localStorage.getItem('vanguard_language') || 'en';
      const result = await analyzeIssueImage(photo, description, language);
      setAiResult(result);
    } catch (err) {
      console.error("AI Analysis process failed: ", err);
      alert("AI pipeline encountered an error. Proceeding with default values.");
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Issue to DB (saves details & triggers functions)
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const mockPhotoUrl = photo;
      
      const payload = {
        title: aiResult?.categoryLabel || 'Civic safety issue',
        description: description,
        photoUrl: mockPhotoUrl,
        audioNoteUrl: voiceUrl || '',
        lat: adjustCoords.lat,
        lng: adjustCoords.lng,
        category: aiResult?.category || 'other',
        severity: aiResult?.severity || 'green',
        riskPrediction: aiResult?.riskPrediction || '',
        severityReason: aiResult?.severityReason || '',
        impactScore: aiResult?.impactScore || 30,
        recommendedAuthority: aiResult?.recommendedAuthority || 'Local Board',
        escalationLevel: aiResult?.escalationLevel || 'community',
        reportText: aiResult?.reportText || '',
        suggestedAction: aiResult?.suggestedAction || '',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // placeholder
      };

      await reportIssue(payload);
      alert("Issue successfully reported to officials!");
      navigate('/');
    } catch (err) {
      console.error("Failed to submit issue: ", err);
      alert("Submission error. Please verify and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
          className="btn-icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-text dark:text-white leading-tight">
            {aiResult ? 'Report Analysis' : 'Report Community Issue'}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {aiResult ? 'Review AI classification parameters' : `Step ${step} of 4`}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: PHOTO UPLOAD */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-vanguard space-y-6"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text dark:text-white">Upload Incident Photo</h3>
              <p className="text-xs text-text-muted">Take a photo of the pothole, trash, leakage, or hazard.</p>
            </div>

            {photo ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border dark:border-slate-700 bg-slate-100">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2.5 shadow-md flex items-center justify-center cursor-pointer transition"
                    title="Remove Photo"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Confirm & Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={triggerFileSelect}
                className="border-3 border-dashed border-border dark:border-slate-700 rounded-2xl h-56 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent hover:bg-accent-soft/30 dark:hover:bg-slate-700/20 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-accent-soft text-accent rounded-full flex items-center justify-center">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-text dark:text-white">Take Photo or Upload</p>
                  <p className="text-xs text-text-muted mt-0.5">Camera capture or gallery image files</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: VOICE DESCRIPTION */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-vanguard space-y-6"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text dark:text-white">Add Voice Description</h3>
              <p className="text-xs text-text-muted">Explain the problem in Hindi, English, or your local dialect (optional).</p>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-pulse-ring' 
                    : 'bg-accent text-white hover:bg-opacity-95'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>

              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {isRecording ? 'Recording... Release to Stop' : 'Hold to Record'}
              </p>

              {isRecording && (
                <div className="flex gap-1 items-center h-8">
                  {[...Array(8)].map((_, i) => (
                    <span 
                      key={i} 
                      className="w-1 bg-red-600 rounded-full animate-bounce"
                      style={{ 
                        height: `${Math.random() * 24 + 8}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>
              )}

              {voiceUrl && (
                <div className="w-full bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-border dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="w-10 h-10 bg-accent text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-opacity-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text dark:text-white">Voice Note Recorded</span>
                      <span className="text-[10px] text-text-muted">Transcribed via Speech-to-Text</span>
                    </div>
                  </div>
                  <audio 
                    ref={audioPlayerRef} 
                    src={voiceUrl} 
                    onEnded={handleAudioEnded}
                    className="hidden" 
                  />
                </div>
              )}

              {transcription && (
                <div className="w-full text-left space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Speech Transcription:</span>
                  <p className="text-sm italic font-medium p-3 bg-slate-50 dark:bg-slate-700/20 border border-border dark:border-slate-700 rounded-lg text-text dark:text-slate-300 leading-relaxed">
                    "{transcription}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="w-1/3 btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(3)} className="w-2/3 btn-primary flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TEXT DESCRIPTION */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-vanguard space-y-6"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text dark:text-white">Add Written Details</h3>
              <p className="text-xs text-text-muted">Optionally write details (e.g. Broken wire near school bus stand).</p>
            </div>

            <div className="space-y-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                rows="5"
                placeholder="Write description details here..."
                className="w-full bg-surface dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-xl p-4 text-sm text-text dark:text-white outline-none focus:border-accent"
              />
              <div className="text-right text-xs text-text-muted font-bold">
                {description.length} / 300 characters
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="w-1/3 btn-secondary">
                Back
              </button>
              <button onClick={() => setStep(4)} className="w-2/3 btn-primary flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: LOCATION CONFIRMATION */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-vanguard space-y-5"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text dark:text-white">Verify Hazard Location</h3>
              <p className="text-xs text-text-muted">Ensure coordinates match the physical incident spot.</p>
            </div>

            <div className="space-y-4">
              
              {/* Interactive React-Leaflet Map coordinates selector */}
              <div className="h-60 w-full rounded-xl overflow-hidden border border-border dark:border-slate-700 relative z-0">
                <MapContainer
                  center={[adjustCoords.lat, adjustCoords.lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapEvents onChangeCoords={handleMapClick} />
                  <Marker position={[adjustCoords.lat, adjustCoords.lng]} />
                  <MapRecenter coords={[adjustCoords.lat, adjustCoords.lng]} />
                </MapContainer>
              </div>

              <div className="text-center text-xs text-text-muted font-bold">
                📍 Click anywhere on the map above to select coordinates.
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-border dark:border-slate-700 space-y-1.5 text-left">
                <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Reported Location Address:</span>
                </div>
                <p className="text-xs font-semibold text-text dark:text-slate-200">
                  {resolvedAddress || 'Determining location coordinates...'}
                </p>
              </div>

              {/* Slider Controls (Elder Friendly) */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-border dark:border-slate-700 text-left">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Fine-tune coordinates:
                </span>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text dark:text-slate-300">
                    <span>Shift Latitude</span>
                    <span>{adjustCoords.lat.toFixed(5)}</span>
                  </div>
                  <input
                    type="range"
                    min={(location.lat - 0.005).toFixed(5)}
                    max={(location.lat + 0.005).toFixed(5)}
                    step="0.0001"
                    value={adjustCoords.lat}
                    onChange={(e) => handleCoordShift('lat', e.target.value)}
                    className="w-full accent-accent"
                  />
                </div>

                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs font-semibold text-text dark:text-slate-300">
                    <span>Shift Longitude</span>
                    <span>{adjustCoords.lng.toFixed(5)}</span>
                  </div>
                  <input
                    type="range"
                    min={(location.lng - 0.005).toFixed(5)}
                    max={(location.lng + 0.005).toFixed(5)}
                    step="0.0001"
                    value={adjustCoords.lng}
                    onChange={(e) => handleCoordShift('lng', e.target.value)}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="w-1/3 btn-secondary">
                Back
              </button>
              <button 
                onClick={handleAIAnalysis}
                className="w-2/3 btn-primary flex items-center justify-center gap-2"
              >
                Analyze with AI <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: AI PIPELINE PROCESSING / RESULTS DISPLAY */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-vanguard space-y-6"
          >
            {aiLoading ? (
              <LoadingShield />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-6 h-6 text-accent" />
                    <h3 className="text-lg font-black text-text dark:text-white">
                      AI Safety Assessment
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-text-muted">
                    Analysis Completed
                  </span>
                </div>

                <AIResultCard 
                  result={aiResult}
                  onDownloadPdf={() => downloadPdfReport({ 
                    ...aiResult, 
                    createdAt: new Date().toISOString(), 
                    reporterName: dbUser?.name, 
                    village: dbUser?.village, 
                    ward: dbUser?.ward, 
                    lat: adjustCoords.lat, 
                    lng: adjustCoords.lng 
                  })}
                  onShareCommunity={() => {
                    alert("Alert posted to community general channel!");
                  }}
                  onSubmit={handleFinalSubmit}
                  submitting={submitting}
                />
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
