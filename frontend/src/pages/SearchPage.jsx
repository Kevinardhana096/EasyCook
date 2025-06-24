import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaTimes, FaSpinner } from 'react-icons/fa';
import RecipeCard from '../components/recipe/RecipeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiClient from '../api/client';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  
  // Search filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load recipes when search params change
  useEffect(() => {
    loadRecipes();
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (sortBy !== 'created_at') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, currentPage, setSearchParams]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/recipes/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (sortBy) params.append('sort_by', sortBy);
      params.append('page', currentPage.toString());
      params.append('per_page', '12');

      let endpoint = '/recipes/';
      if (searchTerm) {
        endpoint = `/recipes/search?${params.toString()}`;
      } else {
        endpoint = `/recipes/?${params.toString()}`;
      }

      const response = await apiClient.get(endpoint);
      const data = response.data;
      
      setRecipes(data.recipes || []);
      setTotalResults(data.pagination?.total || data.recipes?.length || 0);
      setTotalPages(data.pagination?.pages || 1);
      
    } catch (err) {
      setError('Failed to load recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRecipes();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('created_at');
    setCurrentPage(1);
    navigate('/search');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'created_at', label: 'Latest' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">
              Discover Amazing Recipes 🔍
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Search through thousands of delicious recipes from our community
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Search for recipes, ingredients, cuisines..."
                  className="input input-bordered input-lg w-full pl-12 focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg px-8"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
              <p>
                {totalResults > 0 ? (
                  <>
                    Found <span className="font-semibold text-primary">{totalResults}</span> recipes
                    {searchTerm && ` for "${searchTerm}"`}
                  </>
                ) : (
                  'Search for recipes to get started'
                )}
              </p>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-sm btn-outline ${showFilters ? 'btn-active' : ''}`}
                >
                  <FaFilter className="mr-2" />
                  Filters
                </button>
                
                {(searchTerm || selectedCategory || selectedDifficulty || sortBy !== 'created_at') && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    <FaTimes className="mr-2" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedDifficulty}
                    onChange={(e) => {
                      setSelectedDifficulty(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Levels</option>
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort by</label>
                  <select
                    className="select select-bordered w-full"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="alert alert-error mb-8">
              <div>
                <span>{error}</span>
                <button
                  onClick={loadRecipes}
                  className="btn btn-sm btn-ghost ml-4"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Searching for delicious recipes..." />
            </div>
          )}

          {/* No Results */}
          {!loading && !error && recipes.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Recipe Grid */}
          {!loading && recipes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showAuthor={true}
                    className="hover:shadow-lg transition-shadow"
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="btn-group">
                    <button
                      className="btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      «
                    </button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = i + 1;
                      const isActive = page === currentPage;
                      
                      return (
                        <button
                          key={page}
                          className={`btn ${isActive ? 'btn-active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <button className="btn btn-disabled">...</button>
                        <button
                          className="btn"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      className="btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;