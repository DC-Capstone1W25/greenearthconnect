// frontend\src\screens\NewsfeedScreen.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function NewsfeedScreen() {
  // Sample data for newsfeed posts
  const samplePosts = [
    {
      id: 1,
      title: 'Breaking News: New Initiative Launched',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.',
      date: 'March 1, 2025',
      source: 'Air Quality News',
    },
    {
      id: 2,
      title: 'Update: Community Event Scheduled',
      content: 'Cras ultricies ligula sed magna dictum porta. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.',
      date: 'March 2, 2025',
      source: 'Air Quality News',
    },
    {
      id: 3,
      title: 'Insight: Trends in Sustainable Development',
      content: 'Pellentesque in ipsum id orci porta dapibus. Proin eget tortor risus. Curabitur aliquet quam id dui posuere blandit.',
      date: 'March 3, 2025',
      source: 'Air Quality News',
    },
  ];

  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row>
        <Col>
          <h1 className="text-center newsfeed-header">Newsfeed</h1>
          <p className="text-center text-muted">
            Stay updated with the latest news and insights.
          </p>
        </Col>
      </Row>

      {/* Newsfeed Posts */}
      <Row className="mt-4">
        {samplePosts.map((post) => (
          <Col key={post.id} md={4} className="mb-4">
            <Card className="h-100 shadow-sm newsfeed-card">
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Source: {post.source} | {post.date}</Card.Subtitle>
                <Card.Text>{post.content}</Card.Text>
                <div className="text-center">
                  <Button variant="primary" size="sm">Subscribe</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
