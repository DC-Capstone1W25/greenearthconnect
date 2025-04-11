// frontend/src/screens/NewsfeedScreen.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

// Determine the base URL for the backend API
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const baseURL = process.env.REACT_APP_BACKEND_URL || (isDev ? 'http://localhost:5000' : '');

// A separate component for rendering individual news articles
const ArticleCard = ({ article }) => (
  <Col md={4} className="mb-4">
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title>{article.clickbait_headline}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{article.original_title}</Card.Subtitle>
        <Card.Text>{article.summary}</Card.Text>
        <Button 
          variant="primary" 
          size="sm" 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Read More
        </Button>
      </Card.Body>
    </Card>
  </Col>
);

export default function NewsfeedScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Retrieve logged in username (if any) for personalization
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/api/newsfeed`);
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching newsfeed:', err);
        setError(
          err.response?.data?.error ||
          err.response?.statusText ||
          err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="screen-title">Newsfeed</h1>
          <p className="screen-subtitle">
            {username 
              ? `Welcome back, ${username}! Stay updated with the latest air quality news.` 
              : 'Stay updated with the latest air quality news and insights.'}
          </p>
        </Col>
      </Row>

      {/* Loading Indicator */}
      {loading && (
        <Row className="justify-content-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Row>
      )}

      {/* Error Message */}
      {error && (
        <Row className="justify-content-center my-3">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* News Articles */}
      {!loading && !error && (
        <Row className="mt-4">
          {articles.length > 0 ? (
            articles.map((article, idx) => <ArticleCard key={idx} article={article} />)
          ) : (
            <Col>
              <Alert variant="info" className="text-center">
                No news articles available.
              </Alert>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
}
