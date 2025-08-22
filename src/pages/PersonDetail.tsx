import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Film, Tv, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Card>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">{t('year')}</TableHead>
                      <TableHead>{t('title')}</TableHead>
                      <TableHead>{t('role_job')}</TableHead>
                      <TableHead className="w-[80px]">{t('media_type')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.map(credit => {
                      const year = credit.release_date ? new Date(credit.release_date).getFullYear() : (credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : 'N/A');
                      return (
                        <TableRow key={`${credit.id}-${credit.job || credit.character}`}>
                          <TableCell className="font-medium">{year}</TableCell>
                          <TableCell>
                            <Link to={`/media/${credit.media_type}/${credit.id}`} className="hover:underline">
                              {credit.title || credit.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{credit.character || credit.job}</TableCell>
                          <TableCell>
                            {credit.media_type === 'movie' ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Film className="h-5 w-5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('movie')}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Tv className="h-5 w-5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('tv_show')}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonDetailPage;