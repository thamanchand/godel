import { DISTANCE_FILTERS } from '../../../constants';

import styles from './SearchControls.module.scss';

interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  distanceFilter: number;
  onDistanceFilterChange: (val: number) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (val: 'asc' | 'desc') => void;
}

const SearchControls = ({
  searchQuery,
  onSearchChange,
  onKeyPress,
  distanceFilter,
  onDistanceFilterChange,
  sortOrder,
  onSortOrderChange,
}: SearchControlsProps) => {
  return (
    <div className={styles.controls}>
      <input
        type="text"
        placeholder="Enter stop name to search from the list below"
        value={searchQuery}
        onChange={onSearchChange}
        onKeyPress={onKeyPress}
        className={styles.searchInput}
      />
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Distance:</span>
        <select
          className={styles.filterSelect}
          value={distanceFilter}
          onChange={(e) => onDistanceFilterChange(Number(e.target.value))}
        >
          {DISTANCE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Sort:</span>
        <select
          className={styles.filterSelect}
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">Nearest first</option>
          <option value="desc">Farthest first</option>
        </select>
      </div>
    </div>
  );
};

export default SearchControls;
