import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Film, Tv, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useJellyfin } from '@/contexts/JellyfinContext';

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const personPromise = supabase.functions.invoke('get-person-details', {
          body: { personId: id, language: i18n.language },
        });
        const creditsPromise = supabase.functions.invoke('get-person-credits', {
          body: { personId: id, language: i18n.language },
        });

        const [personResult, creditsResult] = await Promise.all([personPromise, creditsPromise]);

        if (personResult.error) throw personResult.error;
        setPerson(personResult.data);

        if (creditsResult.error) throw creditsResult.error;
        const allCredits = [...(creditsResult.data.cast || []), ...(creditsResult.data.crew || [])]
          .filter((credit, index, self) => 
            credit.id && index === self.findIndex((c) => c.id === credit.id)
          )
          .filter(credit => credit.release_date || credit.first_air_date)
          .sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date).getTime();
            const dateB = new Date(b.release_date || b.first_air_date).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          });
        setCredits(allCredits);

      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, i18n.language]);

  const totalPages = Math.ceil(credits.length / ITEMS_PER_PAGE);
  const currentCredits = credits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-1/3 mt-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('no_results_found')}</div>;
  }

  if (jellyfinError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
      </Button>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 items-start">
        <div className="md:col-span-1 lg:col-span-1">
          <Card className="overflow-hidden sticky top-24">
            {person.profile_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${person.profile_path}`} alt={person.name} className="w-full h-auto" />
            ) : (
              <div className="aspect-[2/3] bg-muted flex items-center justify-center text-muted-foreground">
                <User className="h-24 w-24" />
              </div>
            )}
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold">{person.name}</h2>
              <p className="text-sm text-muted-foreground">{t(person.known_for_department.toLowerCase())}</p>
              {person.birthday && (
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(person.birthday).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {person.place_of_birth && (
                <p className="text-sm text-muted-foreground mt-1">{person.place_of_birth}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-3 space-y-8">
          <div>
            <h3 className="text-3xl font-bold mb-4">{t('biography')}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {person.biography || t('no_biography_available')}
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4">{t('filmography')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentCredits.map(credit => {
                const year = credit.release_date ? new Date(credit.release_date).getFullYear() : (credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : 'N/A');
                const title = credit.title || credit.name;
                return (
                  <Link to={`/media/${credit.media_type}/${credit.id}`} key={`${credit.id}-${credit.job || credit.character}`} className="text-left">
                    <Card className="overflow-hidden bg-muted/20 border-border h-full transition-transform hover:scale-105">
                      <div className="aspect-[2/3] bg-muted">
                        {credit.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w500${credit.poster_path}`} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {credit.media_type === 'movie' ? <Film className="h-12 w-12" /> : <Tv className="h-12 w-12" />}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="font-bold text-sm truncate" title={title}>{title}</p>
                        <p className="text-xs text-muted-foreground truncate" title={credit.character || credit.job}>{credit.character || credit.job}</p>
                        <p className="text-xs text-muted-foreground">{year}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-muted-foreground font-mono">
                  {t('page_x_of_y', { x: currentPage, y: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonDetailPage;