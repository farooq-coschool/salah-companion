import { useSettingsStore } from '../store/useSettingsStore';
import { BookOpen, Droplets, Heart, Navigation, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdabScreen() {
  const { setHasSeenAdab } = useSettingsStore();

  const adabPoints = [
    {
      icon: Droplets,
      title: 'Perform Wudu (Ablution)',
      description: 'Ensure you are in a state of physical purity before touching or reciting the Qur\'an.',
    },
    {
      icon: Navigation,
      title: 'Face the Qiblah',
      description: 'It is recommended to face the direction of the Kaaba while reciting.',
    },
    {
      icon: Heart,
      title: 'Sincere Intention',
      description: 'Recite for the sake of Allah alone, seeking His pleasure and guidance.',
    },
    {
      icon: BookOpen,
      title: 'Respectful Posture',
      description: 'Sit respectfully and handle the Qur\'an with care and reverence.',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-12 px-4"
    >
      <div className="text-center mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="icon-badge w-24 h-24 rounded-3xl mx-auto mb-8"
        >
          <BookOpen className="w-12 h-12" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="eyebrow-gold justify-center mb-4"
        >
          Before You Begin
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold font-serif text-stone-900 mb-6 tracking-tight"
        >
          Adab of Reciting the Qur'an
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-stone-600 text-xl leading-relaxed max-w-lg mx-auto"
        >
          Before you begin, please review these important etiquettes of reciting the Holy Qur'an.
        </motion.p>
      </div>

      <div className="space-y-6 mb-16">
        {adabPoints.map((point, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
            className="flex gap-6 p-8 surface surface-interactive rounded-[2rem] transition-all duration-300 group"
          >
            <div className="flex-shrink-0">
              <div className="icon-badge w-14 h-14 rounded-2xl group-hover:scale-110 transition-all duration-300">
                <point.icon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3 tracking-tight group-hover:text-emerald-800 transition-colors">{point.title}</h3>
              <p className="text-stone-600 text-lg leading-relaxed">{point.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => setHasSeenAdab(true)}
        className="btn-gold w-full py-5 px-8 rounded-[2rem] text-xl hover:-translate-y-1"
      >
        <CheckCircle2 className="w-7 h-7 text-gold-300" />
        I Understand and Accept
      </motion.button>
    </motion.div>
  );
}
