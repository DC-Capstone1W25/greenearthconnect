// frontend\src\screens\DashboardScreen.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function DashboardScreen() {
  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row>
        <Col>
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center text-muted">
            Welcome to your personal dashboard!
          </p>
        </Col>
      </Row>

      {/* Example Cards Section */}
      <Row className="mt-4">
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <Card.Text>
                A quick glance at your key metrics or summary information.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <Card.Text>
                Display recent user actions, notifications, or updates here.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Statistics</Card.Title>
              <Card.Text>
                Show data charts, analytics, or any key performance indicators.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Rows/Content */}
      <Row className="mt-4">
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Announcements</Card.Title>
              <Card.Text>
                Keep users informed of important updates or new features.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Resources</Card.Title>
              <Card.Text>
                Provide links to documentation, tutorials, or help sections.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
