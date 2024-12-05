'use client';

import ecosystemApps from 'apps/web/src/data/ecosystem.json';
import { SearchBar } from 'apps/web/src/components/Ecosystem/SearchBar';
import { useMemo, useState, useEffect } from 'react';
import { List } from 'apps/web/src/components/Ecosystem/List';
import { useSearchParams } from 'next/navigation';
import { EcosystemFilters } from 'apps/web/src/components/Ecosystem/EcosystemFilters';
import EcosystemFiltersMobile from 'apps/web/src/components/Ecosystem/EcosystemFiltersMobile';

export type EcosystemApp = {
  searchName: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  description: string;
  imageUrl: string;
};

const config: Record<string, string[]> = {
  wallet: ['self-custody', 'account abstraction', 'multisig'],
  defi: [
    'stablecoin',
    'dex',
    'dex aggregator',
    'lending/borrowing',
    'derivatives',
    'liquidity management',
    'perpetuals',
    'options',
    'portfolio',
    'insurance',
    'yield vault',
  ],
  consumer: [
    'creator',
    'social',
    'gaming',
    'messaging',
    'payments',
    'music',
    'real world',
    'nft',
    'dao',
    'crypto taxes',
  ],
  onramp: ['centralized exchange', 'fiat on-ramp'],
  infra: ['ai', 'depin', 'bridge', 'security', 'developer tool', 'node provider', 'raas'],
};

function orderedEcosystemAppsAsc() {
  return ecosystemApps.sort((a, b) => {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    if (b.name.toLowerCase() > a.name.toLowerCase()) {
      return -1;
    }
    return 0;
  });
}

const decoratedEcosystemApps: EcosystemApp[] = orderedEcosystemAppsAsc().map((d) => ({
  ...d,
  searchName: d.name.toLowerCase(),
}));

const updateUrlParams = (params: { categories?: string[]; subcategories?: string[] }) => {
  console.log('categories:', params.categories);

  console.log('subcategories:', params.subcategories);
  const searchParams = new URLSearchParams(window.location.search);

  if (params.categories?.length) {
    searchParams.set('category', params.categories.join(','));
  } else {
    searchParams.delete('category');
  }

  if (params.subcategories?.length) {
    searchParams.set('subcategory', params.subcategories.join(','));
  } else {
    searchParams.delete('subcategory');
  }

  window.history.pushState(
    {},
    '',
    `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
  );
};

export default function Content() {
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState<number>(16);
  const searchParams = useSearchParams();
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(() => {
    const subcategories = searchParams?.get('subcategory');
    return subcategories ? subcategories.split(',') : [];
  });

  // If a subcategory is selected, the category is selected automatically
  const selectedCategories = useMemo(
    () => [
      ...new Set(
        selectedSubcategories.map(
          (subcategory) =>
            Object.keys(config).find((category) => config[category].includes(subcategory)) ?? 'all',
        ),
      ),
    ],
    [selectedSubcategories],
  );

  const filteredEcosystemApps = useMemo(
    () =>
      decoratedEcosystemApps.filter((app) => {
        const isSubcategoryMatched =
          selectedSubcategories.length === 0 || selectedSubcategories.includes(app.subcategory);
        const isSearched = search === '' || app.searchName.includes(search.toLowerCase());
        return isSubcategoryMatched && isSearched;
      }),
    [selectedSubcategories, search],
  );

  useEffect(() => {
    updateUrlParams({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
    });
  }, [selectedCategories, selectedSubcategories]);

  return (
    <div className="flex min-h-32 w-full flex-col gap-10 pb-32">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:gap-12">
        <EcosystemFilters
          config={config}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          setSelectedSubcategories={setSelectedSubcategories}
        />

        <div className="order-first lg:order-last">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        <EcosystemFiltersMobile
          categories={config}
          selectedSubcategories={selectedSubcategories}
          onSubcategorySelect={setSelectedSubcategories}
        />
      </div>
      <List
        selectedCategories={selectedCategories}
        searchText={search}
        apps={filteredEcosystemApps}
        showCount={showCount}
        setShowCount={setShowCount}
      />
    </div>
  );
}
