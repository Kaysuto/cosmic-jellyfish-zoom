import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailableMedia } from '@/hooks/useAvailableMedia';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid from '../components/catalog/MediaGrid';
import MediaFilters from '../components/catalog/MediaFilters';

const CatalogPage = () => {
  const { t } = useTranslation();
  const { media, loading } = useAvailableMedia();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('updated_at');

  const filteredAndSortedMedia = useMemo(() => {
    return media
      .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortOption === 'release_date') {
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        }
        // Default sort is 'updated_at' (latest additions)
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [media, searchTerm, sortOption]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-2">{t('catalog')}</h1>
      <p className="text-muted-foreground mb-8">{t('catalog_description')}</p>
      
      <MediaFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <MediaGrid media={filteredAndSortedMedia} />
      )}
    </div>
  );
};

export default CatalogPage;