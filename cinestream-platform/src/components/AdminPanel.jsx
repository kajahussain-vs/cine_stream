import React, { useState } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GENRES_LIST = ['Action', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller', 'Drama', 'Documentary', 'Romance'];

export default function AdminPanel({ movies, setMovies }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const initialFormState = {
    title: '',
    description: '',
    genre: 'Action',
    releaseYear: new Date().getFullYear(),
    duration: '',
    image: '',
    videoUrl: '',
    isTrending: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      alert("Please provide a Movie Title first!");
      return;
    }
    if (!GEMINI_API_KEY) {
      alert("No Gemini API key detected. Please configure VITE_GEMINI_API_KEY in your environment setup.");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    const promptMessage = `Generate metadata parameters for the film titled: "${formData.title}".
Provide an engaging story description, choose the single best matching genre from this array: ${JSON.stringify(GENRES_LIST)}, estimate the year of release, and approximate duration formatted as 'Xh Ym'.

Format constraint: You must strictly output a valid JSON object matching this structure:
{
  "description": "Plot logline text",
  "genre": "Single matching genre from list",
  "releaseYear": 2024,
  "duration": "2h 15m"
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptMessage }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (!response.ok) throw new Error("API Connection Interrupted.");

      const rawResult = await response.json();
      const outputText = rawResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText) throw new Error("API returned an empty payload.");
      const parsedData = JSON.parse(outputText.trim());

      setFormData(prev => ({
        ...prev,
        description: parsedData.description || prev.description,
        genre: GENRES_LIST.includes(parsedData.genre) ? parsedData.genre : prev.genre,
        releaseYear: parseInt(parsedData.releaseYear) || prev.releaseYear,
        duration: parsedData.duration || prev.duration,
      }));

    } catch (err) {
      console.error(err);
      setAiError("Metadata auto-fill failed. Check title spelling or connection status.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fallbackImg = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80";
    const fallbackVid = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    const moviePayload = {
      ...formData,
      id: isEditing ? currentEditId : Date.now(),
      image: formData.image.trim() || fallbackImg,
      videoUrl: formData.videoUrl.trim() || fallbackVid,
    };

    let updatedMovies = [...movies];
    if (moviePayload.isTrending) {
      updatedMovies = updatedMovies.map(m => ({ ...m, isTrending: false }));
    }

    if (isEditing) {
      setMovies(updatedMovies.map(m => m.id === currentEditId ? moviePayload : m));
      setIsEditing(false);
      setCurrentEditId(null);
    } else {
      setMovies([moviePayload, ...updatedMovies]);
    }
    setFormData(initialFormState);
  };

  const startEdit = (movie) => {
    setIsEditing(true);
    setCurrentEditId(movie.id);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre || 'Action',
      releaseYear: movie.releaseYear,
      duration: movie.duration || '',
      image: movie.image,
      videoUrl: movie.videoUrl || '',
      isTrending: movie.isTrending || false
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this title?")) {
      setMovies(movies.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Movies</p>
          <h3 className="text-3xl font-black text-white mt-1">{movies.length}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Mock Streams</p>
          <h3 className="text-3xl font-black text-white mt-1">42</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Telemetry Speed</p>
          <h3 className="text-3xl font-black text-emerald-500 mt-1">Optimal</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Creation/Edit Form */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Title Metadata' : 'Add New Title'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Title</label>
              <div className="flex gap-2">
                <input
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
                <button
                  type="button" onClick={handleAiGenerate} disabled={isAiLoading || !formData.title.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 rounded text-xs transition disabled:opacity-45 flex items-center gap-1.5 active:scale-95"
                >
                  {isAiLoading ? 'Working...' : '🪄 AI Fill'}
                </button>
              </div>
              {aiError && <span className="text-[10px] text-red-500 block mt-1">{aiError}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleInputChange} rows="3"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Genre</label>
                <select name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white">
                  {GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Year</label>
                <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Duration</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white" placeholder="2h 15m" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="isTrending" name="isTrending" checked={formData.isTrending} onChange={handleInputChange} className="w-4 h-4 text-red-600 bg-zinc-950 border-zinc-800 rounded cursor-pointer" />
                <label htmlFor="isTrending" className="text-xs text-zinc-300 font-semibold cursor-pointer">Hero Banner</label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Thumbnail URL</label>
                <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Video Source URL</label>
                <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-grow bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded text-sm transition mt-2 active:scale-95">
                {isEditing ? 'Save Edit' : 'Add to Catalog'}
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData(initialFormState); }} className="bg-zinc-800 px-4 rounded text-zinc-300 text-sm hover:bg-zinc-700 mt-2">Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Database List */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Active Database</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                  <th className="pb-3">Title Info</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-sm">
                {movies.map(movie => (
                  <tr key={movie.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="py-4 pr-3 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img src={movie.image} alt={movie.title} className="w-14 aspect-video object-cover rounded flex-shrink-0" />
                        <span className="font-bold block truncate text-zinc-100">{movie.title}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-zinc-400 space-y-1">
                      <span className="bg-zinc-850 px-2 py-0.5 rounded text-zinc-300 inline-block font-semibold">{movie.genre || 'General'}</span>
                      <span className="block">{movie.releaseYear} • {movie.duration || 'N/A'}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(movie)} className="p-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700">📝</button>
                        <button onClick={() => handleDelete(movie.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
