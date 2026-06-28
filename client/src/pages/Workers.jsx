import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  UserCheck, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Star,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useWorkers from '../hooks/useWorkers';
import WorkerCard from '../components/ui/WorkerCard';

export default function Workers() {
  const { t } = useTranslation();
  const { dbUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'post' | 'my-posts'
  const { workers, jobPosts, loading, postJob, updateApplicationStatus } = useWorkers();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Hire Modal states
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showHireSuccess, setShowHireSuccess] = useState(false);

  // Job Post Form Formik-like state
  const [postForm, setPostForm] = useState({
    title: '',
    skillRequired: 'Electrician',
    workersNeeded: '1',
    description: '',
    location: dbUser?.village || '',
    payPerDay: ''
  });
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Expanded Post ID state to see applicant list
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Filter workers based on search and skill chips
  const getFilteredWorkers = () => {
    return workers.filter((worker) => {
      const nameMatch = worker.name.toLowerCase().includes(searchQuery.toLowerCase());
      const skillMatch = worker.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const isChipMatch = activeFilter === 'all' || worker.skills.includes(activeFilter);
      
      return (nameMatch || skillMatch) && isChipMatch;
    });
  };

  const filteredWorkers = getFilteredWorkers();

  // Form submit handler
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.payPerDay) return;

    setPosting(true);
    try {
      await postJob(postForm);
      setPostSuccess(true);
      setPostForm({
        title: '',
        skillRequired: 'Electrician',
        workersNeeded: '1',
        description: '',
        location: dbUser?.village || '',
        payPerDay: ''
      });
      setTimeout(() => {
        setPostSuccess(false);
        setActiveTab('my-posts');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  // Render Stars Helper
  const renderStars = (rating) => {
    const stars = [];
    const val = rating || 5;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${
            i <= val ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
          }`} 
        />
      );
    }
    return stars;
  };

  const skillFilters = ['All', 'Electrician', 'Plumber', 'Farmer', 'Construction', 'Carpenter'];

  return (
    <div className="space-y-6">
      {/* 1. Header Navigation Tabs */}
      <div className="flex border-b border-border dark:border-slate-700">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 text-center py-3.5 text-sm font-bold border-b-2 transition duration-200 cursor-pointer min-h-[48px] ${
            activeTab === 'find'
              ? 'border-accent text-accent dark:text-blue-400 dark:border-blue-400 font-extrabold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Find Workers
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 text-center py-3.5 text-sm font-bold border-b-2 transition duration-200 cursor-pointer min-h-[48px] ${
            activeTab === 'post'
              ? 'border-accent text-accent dark:text-blue-400 dark:border-blue-400 font-extrabold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Post a Job
        </button>
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`flex-1 text-center py-3.5 text-sm font-bold border-b-2 transition duration-200 cursor-pointer min-h-[48px] ${
            activeTab === 'my-posts'
              ? 'border-accent text-accent dark:text-blue-400 dark:border-blue-400 font-extrabold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          My Posts ({jobPosts.length})
        </button>
      </div>

      {/* 2. TAB SUB-CONTENT PANELS */}

      {/* TAB A: FIND WORKERS */}
      {activeTab === 'find' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name or skill..."
              className="w-full min-h-[56px] pl-12 pr-4 bg-surface dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-2xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
            />
          </div>

          {/* Skill Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {skillFilters.map((skill) => (
              <button
                key={skill}
                onClick={() => setActiveFilter(skill.toLowerCase() === 'all' ? 'all' : skill)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold border transition cursor-pointer min-h-[38px] ${
                  (activeFilter === 'all' && skill.toLowerCase() === 'all') || activeFilter === skill
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-surface dark:bg-slate-800 border-border dark:border-slate-700 text-text-muted hover:text-text'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Worker Cards List */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <span className="text-xs text-text-muted font-bold animate-pulse">Syncing worker directory...</span>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="card-vanguard text-center p-8 space-y-2">
              <AlertCircle className="w-10 h-10 text-text-muted mx-auto opacity-45" />
              <p className="font-bold text-sm text-text-muted">No workers matched search criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onHireClick={(w) => setSelectedWorker(w)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: POST A JOB */}
      {activeTab === 'post' && (
        <div className="card-vanguard max-w-xl mx-auto p-6">
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="text-center space-y-1 pb-2">
              <h3 className="text-lg font-black text-text dark:text-white">Post Local Job Opening</h3>
              <p className="text-xs text-text-muted">Directly hire daily-wage work support from community members.</p>
            </div>

            {postSuccess && (
              <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-900 flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Job posted successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Job Title / काम का नाम</label>
              <input
                type="text"
                required
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="e.g. Need electrician for house motor repairs"
                className="w-full min-h-[48px] px-4 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Skill Needed</label>
                <select
                  value={postForm.skillRequired}
                  onChange={(e) => setPostForm({ ...postForm, skillRequired: e.target.value })}
                  className="w-full min-h-[48px] px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Construction">Construction</option>
                  <option value="Carpenter">Carpenter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Workers Count</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={postForm.workersNeeded}
                  onChange={(e) => setPostForm({ ...postForm, workersNeeded: e.target.value })}
                  className="w-full min-h-[48px] px-4 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Description / काम का विवरण</label>
              <textarea
                rows="4"
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                placeholder="Explain the required tasks clearly..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl p-4 text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Location / स्थान</label>
                <input
                  type="text"
                  required
                  value={postForm.location}
                  onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                  className="w-full min-h-[48px] px-4 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase">Pay Per Day / दैनिक मजदूरी</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text dark:text-slate-300 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    required
                    value={postForm.payPerDay}
                    onChange={(e) => setPostForm({ ...postForm, payPerDay: e.target.value })}
                    placeholder="Rate"
                    className="w-full min-h-[48px] pl-8 pr-4 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-sm font-semibold text-text dark:text-white outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={posting}
              className="w-full min-h-[52px] bg-accent hover:bg-opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4 transition"
            >
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Job'}
            </button>
          </form>
        </div>
      )}

      {/* TAB C: MY POSTED JOBS */}
      {activeTab === 'my-posts' && (
        <div className="space-y-4">
          {jobPosts.length === 0 ? (
            <div className="card-vanguard text-center p-8 space-y-2">
              <Briefcase className="w-10 h-10 text-text-muted mx-auto opacity-45" />
              <p className="font-bold text-sm text-text-muted">You haven't posted any job openings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobPosts.map((job) => (
                <div key={job.id} className="card-vanguard p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-extrabold text-text dark:text-white leading-tight">
                        {job.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-normal">
                        Skill: <span className="font-bold text-text dark:text-slate-200">{job.skillRequired}</span> • Needs {job.workersNeeded} workers
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mt-2 border-l-2 border-accent pl-2.5 py-0.5 leading-relaxed">
                    {job.description || 'No detailed description provided.'}
                  </p>

                  <div className="flex justify-between items-center text-xs text-text-muted font-bold pt-2 border-t border-border dark:border-slate-700/60">
                    <span>Pay: ₹{job.payPerDay}/day</span>
                    <button
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      className="text-accent dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {expandedJobId === job.id ? 'Hide Applicants' : `View Applicants (${job.applications?.length || 0})`}
                    </button>
                  </div>

                  {/* Applicants List details expanded */}
                  {expandedJobId === job.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-3 border-t border-border dark:border-slate-700"
                    >
                      <h5 className="text-xs font-black text-text dark:text-slate-300 uppercase tracking-widest">
                        Incoming Worker Applications:
                      </h5>

                      {(job.applications || []).length === 0 ? (
                        <p className="text-xs text-text-muted py-2 italic">No applications received yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {job.applications.map((app) => (
                            <div 
                              key={app.workerId} 
                              className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-border dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${app.name}`}
                                  alt="app"
                                  className="w-10 h-10 rounded-lg object-cover border bg-slate-100"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-bold text-text dark:text-white">{app.name}</span>
                                    <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                                      <span>{app.rating}</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-text-muted mt-0.5 font-bold">
                                    Rate: ₹{app.dailyRate}/day • Status: <span className="capitalize text-accent">{app.status}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {app.status === 'pending' ? (
                                  <>
                                    <button
                                      onClick={() => updateApplicationStatus(job.id, app.workerId, 'accepted')}
                                      className="h-8 px-3.5 bg-success text-white text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer transition active:scale-95"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => updateApplicationStatus(job.id, app.workerId, 'rejected')}
                                      className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text dark:text-white text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer transition active:scale-95"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <span className={`text-xs font-bold uppercase ${
                                    app.status === 'accepted' ? 'text-success' : 'text-text-muted'
                                  }`}>
                                    {app.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. WORKER PROFILE MODAL */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface dark:bg-slate-800 rounded-3xl border border-border dark:border-slate-700 p-6 max-w-md w-full relative space-y-5 shadow-2xl"
          >
            <button 
              onClick={() => { setSelectedWorker(null); setShowHireSuccess(false); }}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center justify-center text-text-muted transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {showHireSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-green-100 text-success rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <UserCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-text dark:text-white">Booking Initiated!</h3>
                <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                  Booking request has been dispatched in real-time to **{selectedWorker.name}**. They will get in touch with you shortly.
                </p>
                <button
                  onClick={() => { setSelectedWorker(null); setShowHireSuccess(false); }}
                  className="w-full btn-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={selectedWorker.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedWorker.name}`}
                      alt="avatar" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-border dark:border-slate-700 bg-slate-100"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-surface dark:border-slate-800 ${
                      selectedWorker.isAvailable ? 'bg-success' : 'bg-danger'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text dark:text-white leading-tight">
                      {selectedWorker.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <div className="flex">{renderStars(selectedWorker.rating)}</div>
                      <span className="text-text-muted font-bold ml-1">({selectedWorker.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-semibold text-text-muted leading-relaxed">
                  <div className="grid grid-cols-2 gap-3 border-t border-b border-border dark:border-slate-700 py-3">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-text-muted mb-0.5">Experience</span>
                      <span className="text-text dark:text-white font-bold">{selectedWorker.experienceYears || 5} Years</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-text-muted mb-0.5">Daily Rate</span>
                      <span className="text-text dark:text-white font-bold text-sm">₹{selectedWorker.dailyRate}/day</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-text-muted mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedWorker.skills || []).map(skill => (
                        <span key={skill} className="bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-300 px-2.5 py-1 rounded-md font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-text-muted mb-1">About Worker</span>
                    <p className="text-text dark:text-slate-300 font-medium">
                      {selectedWorker.bio || 'Professional and local service worker specializing in household utilities and support.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-text dark:text-slate-200 font-bold">{selectedWorker.village || 'Ramanagara'}</span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-2 pt-2">
                  <a 
                    href={`tel:+919999999999`}
                    className="flex-1 min-h-[52px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text dark:text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 border border-border dark:border-slate-600 transition"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <button 
                    onClick={() => { setShowHireSuccess(true); }}
                    className="flex-2 min-h-[52px] bg-accent hover:bg-opacity-95 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5" /> Hire Now
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
