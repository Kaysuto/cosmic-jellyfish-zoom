import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Genre {
  id: number;
  name: string;
}

interface CatalogFiltersProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

const CatalogFilters = ({ genres, selectedGenres, onGenreToggle, sortBy, onSortByChange, onReset }: CatalogFiltersProps) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'popularity.desc', label: t('sort_popularity_desc') },
    { value: 'release_date.desc', label: t('sort_release_date_desc') },
    { value: 'vote_average.desc', label: t('sort_rating_desc') },
  ];

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg"> {t('filter_and_sort')} </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Affinez les résultats rapidement</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">{t('sort_by')}</h4>
          <div className="flex flex-col gap-2">
            {sortOptions.map(option => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "secondary" : "ghost"}
                onClick={() => onSortByChange(option.value)}
                className="justify-start w-full text-sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{t('genres')}</h4>
            <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground transition">Réinitialiser</button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-56">
              <div className="p-3 flex flex-wrap gap-2">
                {genres.map(genre => {
                  const active = selectedGenres.includes(genre.id);
                  return (
                    <Badge
                      key={genre.id}
                      variant={active ? 'default' : 'secondary'}
                      onClick={() => onGenreToggle(genre.id)}
                      className="cursor-pointer select-none"
                    >
                      {genre.name}
                    </Badge>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Astuce</h4>
          <p className="text-sm text-muted-foreground">Utilisez les filtres pour réduire rapidement la liste. Cliquez sur un genre pour l'activer/désactiver.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CatalogFilters;