import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Genre {
  id: number;
  name: string;
}

interface FilterSidebarProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

const FilterSidebar = ({ genres, selectedGenres, onGenreToggle, sortBy, onSortByChange, onReset }: FilterSidebarProps) => {
  const { t } = useTranslation();
  const sortOptions = [
    { value: 'popularity.desc', label: t('sort_popularity_desc') },
    { value: 'release_date.desc', label: t('sort_release_date_desc') },
    { value: 'vote_average.desc', label: t('sort_rating_desc') },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> {t('filter')}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('filter_and_sort')}</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6 h-[calc(100%-120px)]">
          <div>
            <h4 className="font-semibold mb-3 text-lg">{t('sort_by')}</h4>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <Button key={option.value} variant={sortBy === option.value ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => onSortByChange(option.value)}>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col h-[calc(100%-180px)]">
            <h4 className="font-semibold mb-3 text-lg">{t('genres')}</h4>
            <ScrollArea className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <Badge
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? 'default' : 'secondary'}
                    onClick={() => onGenreToggle(genre.id)}
                    className="cursor-pointer text-sm px-3 py-1"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <SheetFooter>
          <Button variant="ghost" onClick={onReset}>{t('reset_filters')}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSidebar;