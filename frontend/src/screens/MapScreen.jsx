// frontend/src/screens/MapScreen.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapScreen() {
  // Retrieve logged in username; default to 'Guest' if not found.
  const username = localStorage.getItem('username') || 'Guest';

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="screen-title">Air Quality Map</h1>
          {/* Remove "text-muted" class so that our CSS rules for dark mode take effect */}
          <p className="screen-subtitle">
            {`Hello, ${username}! Explore real-time air quality data across various locations.`}
          </p>
        </Col>
      </Row>

      {/* Map Display */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </MapContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
