import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import MediaSection from './MediaSection';

interface PopularMediaSectionProps {
  title: string;
  mediaType: 'movie' | 'tv' | 'anime';
  maxItems?: number;
  showViewMore?: boolean;
}

const PopularMediaSection = ({ 
  title, 
  mediaType, 
  maxItems = 10,
  showViewMore = true 
}: PopularMediaSectionProps) => {
  const { t } = useSafeTranslation();

  const fetchPopularMedia = async ({ limit }: { limit: number }) => {
    console.log(`[DEBUG] PopularMediaSection: Fetching ${mediaType} with limit ${limit}`);
    
    // Utiliser des endpoints différents selon le type
    let endpoint = 'get-featured-media';
    let body = { mediaType, limit };
    
    if (mediaType === 'anime') {
      // Pour les animés, utiliser directement discover-media avec la section animes
      endpoint = 'discover-media';
      body = { 
        section: 'animes', 
        language: 'fr-FR', 
        page: 1, 
        sortBy: 'popularity.desc'
      };
    }
    
    const { data, error } = await supabase.functions.invoke(endpoint, { body });
    console.log(`[DEBUG] PopularMediaSection: ${mediaType} response:`, data?.length || 0, 'items');
    
    // discover-media retourne { results: [...] }, get-featured-media retourne directement [...]
    const results = data?.results || data || [];
    
    // Limiter les résultats si nécessaire
    const limitedResults = limit ? results.slice(0, limit) : results;
    
    return { data: limitedResults, error };
  };

  return (
    <MediaSection
      title={title}
      fetchFunction={fetchPopularMedia}
      mediaType={mediaType}
      showRequestButton={true}
      maxItems={maxItems}
      showViewMore={showViewMore}
    />
  );
};

export default PopularMediaSection;
