// frontend\src\screens\DashboardScreen.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function DashboardScreen() {
  return (
    <Container className="mt-4">
      {/* Header Section */}
      <Row>
        <Col>
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center text-muted">
            Welcome to your personal dashboard!
          </p>
        </Col>
      </Row>

       {/* Overview Section */}
       <Row>
        <Col>
          <div id="overview">
            <h1>Welcome to the Air Quality Predictor</h1>
            <p>
              Our web app is designed to provide accurate predictions of air quality, helping you stay informed about the air you breathe.
              By leveraging advanced algorithms and real-time data, we offer insights into current and future air pollution levels.
              Whether you're planning your day or concerned about health impacts, our app equips you with the information you need.
              Explore interactive maps, detailed forecasts, and personalized alerts to make informed decisions.
              Join us in our mission to promote cleaner air and healthier living environments.
            </p>

            {/* AQI Display */}
            <div className="aqi-container">
              <div className="aqi-box good">
                <div className="aqi-value">50</div>
                <div className="aqi-label">Good</div>
              </div>
              <div className="aqi-box moderate">
                <div className="aqi-value">100</div>
                <div className="aqi-label">Moderate</div>
              </div>
              <div className="aqi-box unhealthy">
                <div className="aqi-value">150</div>
                <div className="aqi-label">Unhealthy</div>
              </div>
            </div>
          </div>
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
