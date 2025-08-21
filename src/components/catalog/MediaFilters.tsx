import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface MediaFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

const MediaFilters = ({ searchTerm, setSearchTerm, sortOption, setSortOption }: MediaFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search_in_catalog')}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-4">
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('sort_by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">{t('latest_additions')}</SelectItem>
            <SelectItem value="release_date">{t('most_recent')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MediaFilters;