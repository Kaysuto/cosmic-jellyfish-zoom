import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MediaCard from './MediaCard';
import RequestModal from './RequestModal';
import { useRequestStatus } from '@/hooks/useRequestStatus';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'anime';
  vote_average?: number;
  networks?: { name: string }[];
  isAvailable?: boolean;
  isSoon?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
  isRequested?: boolean;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  origin_country?: string[];
  origin_countries?: string[];
}

interface MediaGridProps {
  items: MediaItem[];
  showRequestButton?: boolean;
  searchTerm?: string;
  onRequest?: (item: MediaItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, showRequestButton = true, searchTerm, onRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const mediaIds = useMemo(() => items.map(item => item.id), [items]);
  const { requestedIds, addRequestedIdAndRefresh, forceRefresh } = useRequestStatus(mediaIds);

  const handleRequest = (item: MediaItem) => {
    if (onRequest) {
      onRequest(item);
    } else {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const onModalSuccess = () => {
    if (selectedItem) {
      // Si l'item est déjà marqué comme demandé, forcer le rafraîchissement
      if (selectedItem.isRequested) {
        forceRefresh();
      } else {
        addRequestedIdAndRefresh(selectedItem.id);
      }
    }
  }

  return (
    <>
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
              key={`${item.id}-${item.media_type}`}
              item={{ ...item, poster_path: item.poster_path || '', isRequested: requestedIds.has(item.id) }}
              showRequestButton={showRequestButton}
              onRequest={onRequest}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {!onRequest && (
        <RequestModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          item={selectedItem}
          onSuccess={onModalSuccess}
        />
      )}
    </>
  );
};

export default MediaGrid;