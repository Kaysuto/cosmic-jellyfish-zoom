import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
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
}

interface MediaGridProps {
  items: MediaItem[];
  showRequestButton?: boolean;
  searchTerm?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, showRequestButton = true, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const mediaIds = useMemo(() => items.map(item => item.id), [items]);
  const { requestedIds: initialRequestedIds } = useRequestStatus(mediaIds);
  const [newlyRequestedIds, setNewlyRequestedIds] = useState<Set<number>>(new Set());

  const requestedIds = useMemo(() => {
    return new Set([...Array.from(initialRequestedIds), ...Array.from(newlyRequestedIds)]);
  }, [initialRequestedIds, newlyRequestedIds]);

  const handleRequest = (item: MediaItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const onModalSuccess = () => {
    if (selectedItem) {
      setNewlyRequestedIds(prev => new Set(prev).add(selectedItem.id));
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
              item={{ ...item, isRequested: requestedIds.has(item.id) }}
              onRequest={handleRequest}
              showRequestButton={showRequestButton}
              searchTerm={searchTerm}
            />
          </motion.div>
        ))}
      </motion.div>
      
      <RequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        onSuccess={onModalSuccess}
      />
    </>
  );
};

export default MediaGrid;