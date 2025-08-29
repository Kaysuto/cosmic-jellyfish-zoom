import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MediaGrid, { MediaItem } from '@/components/catalog/MediaGrid';
import { useJellyfin } from '@/contexts/JellyfinContext';

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string;
  birthday: string;
  place_of_birth: string;
  known_for_department: string;
}

interface PersonCredits {
  cast: MediaItem[];
  crew: MediaItem[];
}

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useSafeTranslation();
  const navigate = useNavigate();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
          body: {
            endpoint: `person/${id}`,
            params: {
              language: i18n.language,
              append_to_response: 'combined_credits',
            },
          },
        });

        if (error) throw error;
        
        setPerson(data);
        setCredits(data.combined_credits);

      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [id, i18n.language]);

  const LoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-[2/3] rounded-lg" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-48 mt-12 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />)}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!person) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('person_not_found')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="outline" className="mb-8">
        <a onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </a>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={`https://image.tmdb.org/t/p/w780${person.profile_path}`}
                alt={person.name}
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold tracking-tight mb-2">{person.name}</h1>
          <p className="text-muted-foreground mb-4">{t('known_for')} {person.known_for_department}</p>
          
          <div className="text-sm text-muted-foreground mb-6">
            {person.birthday && (
              <p>{t('born_on', { date: new Date(person.birthday).toLocaleDateString() })} {person.place_of_birth && `${t('in')} ${person.place_of_birth}`}</p>
            )}
          </div>

          <h2 className="text-2xl font-semibold mb-2">{t('biography')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {person.biography || t('no_biography_available')}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">{t('filmography')}</h2>
        {credits && <MediaGrid items={[...credits.cast, ...credits.crew]} />}
      </div>
    </div>
  );
};

export default PersonDetailPage;