import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function MapScreen() {
  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row>
        <Col>
          <h1 className="text-center">Map</h1>
          <p className="text-center text-muted">
            Explore locations and view interactive map data.
          </p>
        </Col>
      </Row>

      {/* Map Card */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              {/* Replace this div with interactive map component */}
              <div
                style={{
                  height: '500px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <h4>Interactive Map Placeholder</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
