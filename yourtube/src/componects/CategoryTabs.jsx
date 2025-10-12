import React, { useState } from 'react'
import { Button } from './UI/Button2';

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={activeCategory === cat ? "default" : "secondary"}
          onClick={() => setActiveCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  )
}

export default CategoryTabs
