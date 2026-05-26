import React, { useState } from 'react';
import AdminPanel from './components/AdminPanel';
import VideoPlayer from './components/VideoPlayer';
import CineBot from './components/CineBot';

const INITIAL_MOVIES = [
  {
    id: 1,
    title: "Interstellar Odyssey",
    description: "A team of explorers travel beyond this galaxy to discover whether mankind has a future among the stars in this mind-bending sci-fi epic.",
    genre: "Sci-Fi",
    releaseYear: 2014,
    duration: "2h 49m",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTrending: true,
  },
  {
    id: 2,
    title: "Shadows of Tokyo",
    description: "A retired detective is pulled back into the neon-lit underworld of Tokyo to solve one final, highly personal conspiracy.",
    genre: "Thriller",
    releaseYear: 2021,
    duration: "1h 58m",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTrending: false,
  },
  {
    id: 3,
    title: "The Midnight Protocol",
    description: "When an elite cybersecurity unit goes rogue, a lone analyst must race against time to prevent a global digital blackout.",
    genre: "Action",
    releaseYear: 2023,
    duration: "2h 05m",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isTrending: false,
  }
];

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [myList, setMyList] = useState([2]);
  const [activeMovieToPlay, setActiveMovieToPlay] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMyList = (id) => {
    if (myList.includes(id)) {
      setMyList(myList.filter(mId => mId !== id));
    } else {
      setMyList([...myList, id]);
    }
  };

  const trendingMovie = movies.find(m => m.isTrending) || movies[0];
  const myListMovies = movies.filter(m => myList.includes(m.id));

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white pb-12">

      {/* HEADER NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur-md border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black tracking-tighter text-red-600 cursor-pointer">
                CINESTREAM
              </span>
              <div className="hidden md:flex space-x-6 text-sm font-medium text-zinc-400">
                <button className="hover:text-white transition">Home</button>
                <button className="hover:text-white transition">Movies</button>
                <button className="hover:text-white transition">TV Shows</button>
                <button className="hover:text-white transition">My List</button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase border transition duration-200 ${
                  isAdminMode
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-red-600/10 border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white'
                }`}
              >
                {isAdminMode ? 'User View' : 'Admin Panel'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#141414] border-t border-zinc-900 px-4 py-3 space-y-3">
            <button className="block w-full text-left text-zinc-300 hover:text-white py-1">Home</button>
            <button className="block w-full text-left text-zinc-300 hover:text-white py-1">Movies</button>
            <button className="block w-full text-left text-zinc-300 hover:text-white py-1">TV Shows</button>
            <button className="block w-full text-left text-zinc-300 hover:text-white py-1">My List</button>
          </div>
        )}
      </nav>

      {/* VIEW DECOUPLER */}
      {!isAdminMode ? (
        <div>
          {/* CINEMATIC HERO */}
          {trendingMovie && (
            <div className="relative h-[70vh] md:h-[80vh] w-full flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src={trendingMovie.image} alt={trendingMovie.title} className="w-full h-full object-cover brightness-[0.35]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent hidden md:block" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-block bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                    Trending Title
                  </span>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">{trendingMovie.title}</h1>
                  <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed">{trendingMovie.description}</p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveMovieToPlay(trendingMovie)}
                      className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-zinc-200 transition text-sm active:scale-95"
                    >
                      Play Title
                    </button>
                    <button
                      onClick={() => toggleMyList(trendingMovie.id)}
                      className="flex items-center gap-2 border border-zinc-500 bg-black/40 px-6 py-2.5 rounded hover:bg-zinc-800 transition text-sm text-white"
                    >
                      {myList.includes(trendingMovie.id) ? '✓ In My List' : '+ My List'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRID ROWS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded"></span>Featured Content
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movies.map((movie) => (
                  <div key={movie.id} className="group bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition duration-200">
                    <div className="aspect-video overflow-hidden relative">
                      <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-red-500">{movie.genre || 'General'}</span>
                      <h3 className="font-bold text-sm truncate">{movie.title}</h3>
                      <div className="flex items-center justify-between pt-1">
                        <button onClick={() => setActiveMovieToPlay(movie)} className="text-xs text-zinc-400 hover:text-white transition font-semibold">Play</button>
                        <button onClick={() => toggleMyList(movie.id)} className="text-zinc-500 hover:text-white transition">
                          {myList.includes(movie.id) ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded"></span>My Watchlist
              </h2>
              {myListMovies.length === 0 ? (
                <p className="text-sm text-zinc-500">Your watchlist is currently empty.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myListMovies.map((movie) => (
                    <div key={movie.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                      <img src={movie.image} alt={movie.title} className="w-full aspect-video object-cover" />
                      <div className="p-3 flex items-center justify-between">
                        <span className="font-bold text-sm truncate max-w-[120px]">{movie.title}</span>
                        <button onClick={() => toggleMyList(movie.id)} className="text-xs text-zinc-500 hover:text-red-500">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AdminPanel movies={movies} setMovies={setMovies} />
      )}

      {/* CHATBOT */}
      <CineBot movies={movies} />

      {/* OVERLAY VIDEO PLAYER */}
      {activeMovieToPlay && (
        <VideoPlayer
          movie={activeMovieToPlay}
          onClose={() => setActiveMovieToPlay(null)}
        />
      )}

    </div>
  );
}
