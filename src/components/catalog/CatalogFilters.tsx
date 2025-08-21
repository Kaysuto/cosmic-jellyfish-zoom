import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Filter {
  id: number;
  name: string;
  type: 'genre' | 'keyword';
}

interface CatalogFiltersProps {
  filters: Filter[];
  selectedGenres: number[];
  selectedKeywords: number[];
  onFilterToggle: (id: number, type: 'genre' | 'keyword') => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

const CatalogFilters = ({ filters, selectedGenres, selectedKeywords, onFilterToggle, sortBy, onSortByChange, onReset }: CatalogFiltersProps) => {
  const { t } = useTranslation();
  const sortOptions = [
    { value: 'popularity.desc', label: t('sort_popularity_desc') },
    { value: 'release_date.desc', label: t('sort_release_date_desc') },
    { value: 'vote_average.desc', label: t('sort_rating_desc') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('filter_and_sort')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 text-base">{t('sort_by')}</h4>
          <div className="space-y-2">
            {sortOptions.map(option => (
              <Button key={option.value} variant={sortBy === option.value ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => onSortByChange(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3 text-base">{t('genres')}</h4>
          <ScrollArea className="h-64">
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => {
                const isSelected = filter.type === 'genre' ? selectedGenres.includes(filter.id) : selectedKeywords.includes(filter.id);
                return (
                  <Badge
                    key={`${filter.type}-${filter.id}`}
                    variant={isSelected ? 'default' : 'secondary'}
                    onClick={() => onFilterToggle(filter.id, filter.type)}
                    className="cursor-pointer text-sm px-3 py-1"
                  >
                    {filter.name}
                  </Badge>
                )
              })}
            </div>
          </ScrollArea>
        </div>
        <div className="border-t pt-6">
          <Button variant="ghost" onClick={onReset} className="w-full">{t('reset_filters')}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CatalogFilters;