// frontend\src\screens\MapScreen.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapScreen() {
  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row>
        <Col>
          <h1 className="text-center">Air Quality Map</h1>
          <p className="text-center text-muted">
            Explore air quality levels across various locations.
          </p>
        </Col>
      </Row>

      {/* Map Card */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body style={{ padding: 0 }}>
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
                {/* Base map layer */}
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
