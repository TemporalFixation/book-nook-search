import { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState({ author: '', title: '', isbn: '' });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooks([]);
    try {
      // Build Google Books API query
      let q = [];
      if (query.title) q.push(`intitle:${query.title}`);
      if (query.author) q.push(`inauthor:${query.author}`);
      if (query.isbn) q.push(`isbn:${query.isbn}`);
      if (q.length === 0) {
        setError('Please enter at least one search field.');
        setLoading(false);
        return;
      }
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q.join('+')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBooks(data.items || []);
    } catch (err) {
      setError('Error fetching book data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Book Search</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={query.author}
          onChange={handleChange}
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={query.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="isbn"
          placeholder="ISBN-10 or ISBN-13"
          value={query.isbn}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="results">
        {books.length > 0 ? (
          books.map((item, idx) => {
            const book = item.volumeInfo;
            const title = book.title || 'N/A';
            const authors = book.authors ? book.authors.join(', ') : 'N/A';
            const publisher = book.publisher || null;
            const publishedDate = book.publishedDate || 'N/A';
            const pageCount = book.pageCount || 'N/A';
            const industryIdentifiers = book.industryIdentifiers || [];
            const isbns = industryIdentifiers.map(id => id.identifier).join(', ') || 'N/A';
            const coverUrl = book.imageLinks?.thumbnail || null;
            const googleBooksUrl = item.volumeInfo.infoLink || null;
            return (
              <div key={item.id || idx} className="book-card">
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt={`Cover for ${title}`}
                    className="book-cover"
                    style={{ width: '120px', height: 'auto', float: 'right', marginLeft: '1rem', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                  />
                )}
                <h2>{title}</h2>
                <p><strong>Author(s):</strong> {authors}</p>
                <p><strong>ISBN(s):</strong> {isbns}</p>
                <p><strong>Page Count:</strong> {pageCount}</p>
                <p><strong>Publication Date:</strong> {publishedDate}</p>
                {publisher ? (
                  <p><strong>Publisher(s):</strong> {publisher}</p>
                ) : (
                  <p><strong>Publisher(s):</strong> <span style={{color:'#d32f2f'}}>No publisher information found.</span></p>
                )}
                {googleBooksUrl && (
                  <a
                    href={googleBooksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ol-link"
                    style={{ display: 'inline-block', marginTop: '0.5rem', color: '#23235b', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    View on Google Books
                  </a>
                )}
              </div>
            );
          })
        ) : (
          !loading && <p>No results found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
