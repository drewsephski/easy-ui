"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoriesFilterProps {
  categories: { name: string; slug: string }[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
}

const CategoriesFilter: React.FC<CategoriesFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="mb-2 px-2 text-sm font-semibold tracking-tight">Categories</h3>
      <Button
        variant={selectedCategory === null ? 'secondary' : 'ghost'}
        className="w-full justify-start rounded-full"
        onClick={() => onSelectCategory(null)}
      >
        All Components
      </Button>
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant={selectedCategory === category.slug ? 'secondary' : 'ghost'}
          className="w-full justify-start rounded-full"
          onClick={() => onSelectCategory(category.slug)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoriesFilter;