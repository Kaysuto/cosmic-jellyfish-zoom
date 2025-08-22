import React from 'react';
import { motion } from 'framer-motion';
import MediaCard from './MediaCard';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'anime';
  vote_average?: number;
}

interface MediaGridProps {
  items: MediaItem[];
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
  searchTerm?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, showRequestButton = true, onRequest, searchTerm }) => {
  return (
    <motion.div
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {items.map((item, index) => (
        <motion.div
          key={`${item.id}-${item.media_type}`}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: index * 0.03, ease: "easeInOut" }}
        >
          <MediaCard 
            item={item} 
            onRequest={onRequest} 
            showRequestButton={showRequestButton} 
            searchTerm={searchTerm} 
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MediaGrid;