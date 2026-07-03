import { useState } from 'react';
import { Music, Youtube, Search, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  type: 'nasheed' | 'salam' | 'qawwali';
  duration: string;
  /** Opens this search on YouTube in a new tab when the track is clicked. */
  youtubeUrl: string;
}

function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

const TAB_LABELS: Record<'all' | 'nasheed' | 'salam' | 'qawwali', string> = {
  all: 'All',
  nasheed: 'Nasheeds',
  salam: 'Salams',
  qawwali: 'Qawwalis',
};

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'nasheed' | 'salam' | 'qawwali'>('all');

  const tracks: Track[] = [
    // --- Nasheeds ---
    { id: 'n1', title: "Tala'al Badru Alayna", artist: 'Traditional', type: 'nasheed', duration: '4:30', youtubeUrl: youtubeSearchUrl("Tala'al Badru Alayna nasheed") },
    { id: 'n2', title: 'Qamarun', artist: 'Maher Zain & Mostafa Atef', type: 'nasheed', duration: '3:45', youtubeUrl: youtubeSearchUrl('Qamarun Maher Zain Mostafa Atef') },
    { id: 'n3', title: 'Ya Taybah', artist: 'Maher Zain', type: 'nasheed', duration: '4:12', youtubeUrl: youtubeSearchUrl('Ya Taybah Maher Zain') },
    { id: 'n4', title: 'Insha Allah', artist: 'Maher Zain', type: 'nasheed', duration: '4:20', youtubeUrl: youtubeSearchUrl('Insha Allah Maher Zain') },
    { id: 'n5', title: 'Tabarak Allah', artist: 'Maher Zain', type: 'nasheed', duration: '4:05', youtubeUrl: youtubeSearchUrl('Tabarak Allah Maher Zain') },
    { id: 'n6', title: 'Assalamu Alayka', artist: 'Maher Zain', type: 'nasheed', duration: '4:40', youtubeUrl: youtubeSearchUrl('Assalamu Alayka Maher Zain') },

    // --- Salams ---
    { id: 's1', title: 'Ya Nabi Salam Alayka', artist: 'Traditional', type: 'salam', duration: '5:15', youtubeUrl: youtubeSearchUrl('Ya Nabi Salam Alayka salam') },
    { id: 's2', title: 'Assalamu Alayka Ya RasulAllah', artist: 'Traditional', type: 'salam', duration: '5:00', youtubeUrl: youtubeSearchUrl('Assalamu Alayka Ya RasulAllah salam') },
    { id: 's3', title: 'Ya Imam Ar-Rusul', artist: 'Traditional', type: 'salam', duration: '4:50', youtubeUrl: youtubeSearchUrl('Ya Imam Ar-Rusul salam') },
    { id: 's4', title: 'Mustafa Jaan-e-Rehmat', artist: 'Traditional', type: 'salam', duration: '6:10', youtubeUrl: youtubeSearchUrl('Mustafa Jaan-e-Rehmat salam') },

    // --- Qawwalis ---
    { id: 'q1', title: 'Tajdar-e-Haram', artist: 'Sabri Brothers', type: 'qawwali', duration: '10:20', youtubeUrl: youtubeSearchUrl('Tajdar-e-Haram Sabri Brothers qawwali') },
    { id: 'q2', title: 'Bhar Do Jholi Meri', artist: 'Amjad Sabri', type: 'qawwali', duration: '8:45', youtubeUrl: youtubeSearchUrl('Bhar Do Jholi Meri Amjad Sabri qawwali') },
    { id: 'q3', title: 'Man Kunto Maula', artist: 'Nusrat Fateh Ali Khan', type: 'qawwali', duration: '12:30', youtubeUrl: youtubeSearchUrl('Man Kunto Maula Nusrat Fateh Ali Khan qawwali') },
    { id: 'q4', title: 'Allah Hoo Allah Hoo', artist: 'Nusrat Fateh Ali Khan', type: 'qawwali', duration: '11:15', youtubeUrl: youtubeSearchUrl('Allah Hoo Allah Hoo Nusrat Fateh Ali Khan qawwali') },
    { id: 'q5', title: 'Mera Piya Ghar Aaya', artist: 'Nusrat Fateh Ali Khan', type: 'qawwali', duration: '9:40', youtubeUrl: youtubeSearchUrl('Mera Piya Ghar Aaya Nusrat Fateh Ali Khan qawwali') },
    { id: 'q6', title: 'Dama Dam Mast Qalandar', artist: 'Nusrat Fateh Ali Khan', type: 'qawwali', duration: '9:10', youtubeUrl: youtubeSearchUrl('Dama Dam Mast Qalandar Nusrat Fateh Ali Khan qawwali') },
    { id: 'q7', title: 'Khwaja Ki Deewani', artist: 'Sabri Brothers', type: 'qawwali', duration: '8:20', youtubeUrl: youtubeSearchUrl('Khwaja Ki Deewani Sabri Brothers qawwali') },
    { id: 'q8', title: 'Kise Da Yaar Na Vichray', artist: 'Aziz Mian', type: 'qawwali', duration: '13:50', youtubeUrl: youtubeSearchUrl('Kise Da Yaar Na Vichray Aziz Mian qawwali') },
    { id: 'q9', title: 'Chaap Tilak Sab Chheeni', artist: 'Fareed Ayaz & Abu Muhammad', type: 'qawwali', duration: '7:35', youtubeUrl: youtubeSearchUrl('Chaap Tilak Sab Chheeni Fareed Ayaz Abu Muhammad qawwali') },
    { id: 'q10', title: 'Aaj Rang Hai', artist: 'Fareed Ayaz & Abu Muhammad', type: 'qawwali', duration: '10:05', youtubeUrl: youtubeSearchUrl('Aaj Rang Hai Fareed Ayaz Abu Muhammad qawwali') },
    { id: 'q11', title: 'Yeh Jo Halka Halka Suroor Hai', artist: 'Nusrat Fateh Ali Khan', type: 'qawwali', duration: '8:55', youtubeUrl: youtubeSearchUrl('Yeh Jo Halka Halka Suroor Hai Nusrat Fateh Ali Khan qawwali') },
    { id: 'q12', title: 'Ya Ghaus-e-Azam Ya Nizamuddin', artist: 'Sabri Brothers', type: 'qawwali', duration: '9:25', youtubeUrl: youtubeSearchUrl('Ya Ghaus-e-Azam Ya Nizamuddin Sabri Brothers qawwali') },
    { id: 'q13', title: 'Mast Nazron Se Allah Bachaye', artist: 'Sabri Brothers', type: 'qawwali', duration: '7:50', youtubeUrl: youtubeSearchUrl('Mast Nazron Se Allah Bachaye Sabri Brothers qawwali') },
    { id: 'q14', title: 'Sanwal Yaar Piya', artist: 'Rahat Fateh Ali Khan', type: 'qawwali', duration: '8:10', youtubeUrl: youtubeSearchUrl('Sanwal Yaar Piya Rahat Fateh Ali Khan qawwali') },
    { id: 'q15', title: 'Meri Zindagi Hai Qawwali', artist: 'Rahat Fateh Ali Khan', type: 'qawwali', duration: '6:45', youtubeUrl: youtubeSearchUrl('Meri Zindagi Hai Qawwali Rahat Fateh Ali Khan') },
    { id: 'q16', title: 'Ni Main Jana Jogi De Naal', artist: 'Abida Parveen', type: 'qawwali', duration: '10:50', youtubeUrl: youtubeSearchUrl('Ni Main Jana Jogi De Naal Abida Parveen qawwali') },
    { id: 'q17', title: 'Har Lehza Hai Momin', artist: 'Aziz Mian', type: 'qawwali', duration: '14:20', youtubeUrl: youtubeSearchUrl('Har Lehza Hai Momin Aziz Mian qawwali') },
    { id: 'q18', title: 'Mushkil Kusha Haider Hai', artist: 'Aziz Mian', type: 'qawwali', duration: '11:40', youtubeUrl: youtubeSearchUrl('Mushkil Kusha Haider Hai Aziz Mian qawwali') },
  ];

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || track.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const openOnYoutube = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto pb-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="icon-badge p-4 rounded-2xl">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <p className="eyebrow-gold mb-1">Nasheeds, Salams &amp; Qawwalis</p>
            <h1 className="text-4xl font-bold font-serif text-stone-900 tracking-tight">Audio Library</h1>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 rounded-2xl leading-5 input-premium placeholder-stone-400 sm:text-sm shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
      </div>

      <p className="text-sm text-stone-500 -mt-4 flex items-center gap-1.5">
        <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
        Tap any track to watch/listen on YouTube in a new tab.
      </p>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {(['all', 'nasheed', 'salam', 'qawwali'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab
                ? 'bg-[#0B3D2E] text-gold-200 shadow-md shadow-emerald-950/20 scale-105 border border-gold-400/40'
                : 'surface text-stone-600 hover:border-gold-300/50'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Track List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface rounded-[2.5rem] overflow-hidden"
      >
        <div className="divide-y divide-stone-100/80">
          <AnimatePresence mode="popLayout">
            {filteredTracks.map((track, index) => (
              <motion.button
                key={track.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => openOnYoutube(track.youtubeUrl)}
                className="w-full text-left p-5 md:p-6 flex items-center gap-5 hover:bg-gold-50/40 transition-all duration-300 group"
              >
                <div className="p-3 rounded-full text-rose-600 bg-rose-50 group-hover:bg-rose-100 group-hover:scale-110 transition-all duration-300 shrink-0">
                  <Youtube className="w-7 h-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate tracking-tight text-stone-800 group-hover:text-emerald-700 transition-colors">
                    {track.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                    <span className="font-medium">{track.artist}</span>
                    <span className="w-1 h-1 rounded-full bg-gold-400"></span>
                    <span className="capitalize text-gold-700 font-medium">{track.type}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-stone-400 text-sm font-bold bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100 shrink-0">
                  <Clock className="w-4 h-4" />
                  {track.duration}
                </div>

                <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-gold-500 transition-colors shrink-0" />
              </motion.button>
            ))}
          </AnimatePresence>
          
          {filteredTracks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center text-stone-500 flex flex-col items-center justify-center"
            >
              <Music className="w-12 h-12 mb-4 text-stone-300" />
              <p className="text-lg font-medium">No tracks found matching your criteria.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
