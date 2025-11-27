import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { eventsAPI } from '../services/api';
import EventCard from '../components/Events/EventCard';
import { EventsGridSkeleton } from '../components/Loading/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useInfiniteScroll } from '../utils/useInfiniteScroll';
import useDebounce from '../utils/useDebounce';
import VirtualList from '../components/VirtualList';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState(() => {
    const saved = localStorage.getItem('eventFilters');
    return saved ? JSON.parse(saved) : { category: 'all', sort: 'newest' };
  });
  const [search, setSearch] = useState('');
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Debounced search for performance
  const debouncedSearch = useDebounce(search, 500);

  const categories = ['All', 'Sports', 'Academic', 'Cultural', 'Exhibition', 'Debate', 'Workshop', 'Social'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'ending-soon', label: 'Ending Soon' }
  ];

  useEffect(() => {
    setPage(1);
    setEvents([]);
    setHasMore(true);
    loadEvents(1);
  }, [filter.category, debouncedSearch]);

  // Save filter preferences
  useEffect(() => {
    localStorage.setItem('eventFilters', JSON.stringify(filter));
  }, [filter]);

  // Enable virtual scrolling for large lists
  useEffect(() => {
    setUseVirtualScroll(events.length > 50);
  }, [events.length]);

  const loadEvents = async (pageNum = page) => {
    if (!hasMore && pageNum > 1) return;
    
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 12,
        ...(filter.category !== 'all' && { category: filter.category }),
        ...(debouncedSearch && { search: debouncedSearch })
      };
      
      const response = await eventsAPI.getAll(params);
      const newEvents = response.data.events || [];
      
      if (pageNum === 1) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }
      
      setHasMore(newEvents.length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = useCallback((done) => {
    if (!loading && hasMore) {
      loadEvents(page + 1).then(done);
    } else {
      done();
    }
  }, [page, loading, hasMore]);

  const [isFetching] = useInfiniteScroll(loadMoreEvents);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({ category: 'all', sort: 'newest' });
    setSearch('');
    localStorage.removeItem('eventFilters');
  };

  // Memoized sorted events for performance
  const filteredEvents = useMemo(() => {
    const sorted = [...events];
    switch (filter.sort) {
      case 'popular':
        return sorted.sort((a, b) => b.registeredCount - a.registeredCount);
      case 'ending-soon':
        return sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [events, filter.sort]);

  // Render event card for virtual list
  const renderEventCard = useCallback((event) => (
    <EventCard key={event._id} event={event} />
  ), []);

  return (
    <div className="events-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Discover Events</h1>
          <p>Find and register for upcoming school events</p>
        </div>
      </div>

      <div className="container">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="debounced-input"
            />
            {search && search !== debouncedSearch && (
              <div className="search-loading">
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              </div>
            )}
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="category-filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-btn ${filter.category === cat.toLowerCase() ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', cat.toLowerCase())}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="sort-select"
                value={filter.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="results-info">
            <p>{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found</p>
            {useVirtualScroll && (
              <span className="virtual-scroll-badge">Virtual Scrolling Enabled</span>
            )}
          </div>
        )}

        {/* Events Grid */}
        {loading && page === 1 ? (
          <EventsGridSkeleton count={9} />
        ) : filteredEvents.length > 0 ? (
          <>
            {useVirtualScroll ? (
              <VirtualList
                items={filteredEvents}
                itemHeight={400}
                containerHeight={800}
                renderItem={renderEventCard}
                overscan={2}
                className="events-virtual-list"
              />
            ) : (
              <div className="events-grid gpu-accelerated">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
            {isFetching && hasMore && !useVirtualScroll && (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="spinner"></div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="No events found"
            message="Try adjusting your search or filters to find what you're looking for"
            action={clearFilters}
            actionLabel="Clear Filters"
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;

