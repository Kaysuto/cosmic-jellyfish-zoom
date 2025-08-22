import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Film, Tv, Flame, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Genre { id: number; name: string; }
interface Studio { id: number; name: string; }
interface Network { id: number; name: string; }

interface CatalogFiltersProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
  onReset: () => void;
  mediaType: 'movie' | 'tv' | 'anime';
  onMediaTypeChange: (type: 'movie' | 'tv' | 'anime') => void;
  studios: Studio[];
  selectedStudios: number[];
  onStudioToggle: (studioId: number) => void;
  networks: Network[];
  selectedNetworks: number[];
  onNetworkToggle: (networkId: number) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const CatalogFilters = ({ 
  genres, selectedGenres, onGenreToggle, 
  onReset, 
  mediaType, onMediaTypeChange,
  studios, selectedStudios, onStudioToggle,
  networks, selectedNetworks, onNetworkToggle,
  sortBy, onSortByChange
}: CatalogFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('filter_and_sort')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-7">
            <X className="mr-1 h-3 w-3" />
            {t('clear_filters')}
          </Button>
        </div>
        <CardDescription>{t('catalog_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">{t('media_type')}</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={mediaType === 'movie' ? 'secondary' : 'ghost'} onClick={() => onMediaTypeChange('movie')}><Film className="mr-2 h-4 w-4" />{t('movie')}</Button>
            <Button variant={mediaType === 'tv' ? 'secondary' : 'ghost'} onClick={() => onMediaTypeChange('tv')}><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</Button>
            <Button variant={mediaType === 'anime' ? 'secondary' : 'ghost'} onClick={() => onMediaTypeChange('anime')}><Flame className="mr-2 h-4 w-4" />{t('anime')}</Button>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold text-sm mb-2">{t('sort_by')}</h4>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('sort_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">{t('sort_popularity_desc')}</SelectItem>
              <SelectItem value="release_date.desc">{t('sort_release_date_desc')}</SelectItem>
              <SelectItem value="vote_average.desc">{t('sort_vote_average_desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <Accordion type="multiple" defaultValue={['genres']} className="w-full">
          <AccordionItem value="genres">
            <AccordionTrigger>{t('genres')}</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-64">
                <div className="space-y-1 pr-4">
                  {genres.map(genre => (
                    <Button
                      key={genre.id}
                      variant={selectedGenres.includes(genre.id) ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onGenreToggle(genre.id)}
                    >
                      {genre.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
          {mediaType === 'movie' && (
            <AccordionItem value="studios">
              <AccordionTrigger>{t('studios')}</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-48">
                  <div className="space-y-1 pr-4">
                    {studios.map(studio => (
                      <Button
                        key={studio.id}
                        variant={selectedStudios.includes(studio.id) ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => onStudioToggle(studio.id)}
                      >
                        {studio.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
          {(mediaType === 'tv' || mediaType === 'anime') && (
            <AccordionItem value="networks">
              <AccordionTrigger>{t('networks')}</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-48">
                  <div className="space-y-1 pr-4">
                    {networks.map(network => (
                      <Button
                        key={network.id}
                        variant={selectedNetworks.includes(network.id) ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => onNetworkToggle(network.id)}
                      >
                        {network.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CatalogFilters;