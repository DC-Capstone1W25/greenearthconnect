// frontend\src\screens\DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Function to map AQI value to a color for the circular gauge
function getAQIColor(aqi) {
  if (aqi <= 50) return '#00E400';       // Good: Green
  if (aqi <= 100) return '#FFFF00';      // Moderate: Yellow
  if (aqi <= 150) return '#FF7E00';      // Unhealthy for Sensitive Groups: Orange
  if (aqi <= 200) return '#FF0000';      // Unhealthy: Red
  if (aqi <= 300) return '#99004C';      // Very Unhealthy: Purple
  return '#7E0023';                      // Hazardous: Maroon
}

export default function DashboardScreen() {
  // Get username from localStorage
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // State for AQI Prediction inputs and output
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [precipitation, setPrecipitation] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulated AQI trend data for visualization (last 7 days)
  const [aqiTrendData, setAqiTrendData] = useState({
    labels: [],
    datasets: [{
      label: 'AQI Trend',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.4,
    }],
  });

  useEffect(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Simulated AQI values for each day
    const data = [45, 60, 55, 70, 65, 50, 80];
    setAqiTrendData({
      labels,
      datasets: [{
        label: 'AQI Trend',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      }],
    });
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Use a relative URL so that it works in production and local environments.
      const { data } = await axios.get('/api/aqi/predict', {
        params: {
          temperature,
          humidity,
          wind_speed: windSpeed,
          precipitation,
        },
      });
      setPrediction(data);
    } catch (error) {
      console.error('Error fetching AQI prediction:', error);
      setPrediction({ error: 'Failed to fetch prediction' });
    }
    setLoading(false);
  };

  return (
    <Container fluid className="mt-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center welcome-message">
            {username 
              ? `Welcome, ${username}, to your personal dashboard!` 
              : 'Welcome to your personal dashboard!'}
          </p>
        </Col>
      </Row>

      {/* Main Section: AQI Prediction & Visualization */}
      <Row>
        {/* AQI Prediction Form & Circular Gauge */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>AQI Prediction</Card.Title>
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formTemperature">
                      <Form.Label>Temperature (°F)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 70"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formHumidity">
                      <Form.Label>Humidity (%)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 30"
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formWindSpeed">
                      <Form.Label>Wind Speed (mph)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 10"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formPrecipitation">
                      <Form.Label>Precipitation</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 0"
                        value={precipitation}
                        onChange={(e) => setPrecipitation(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" onClick={handlePredict} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Get AQI Prediction'}
                </Button>
              </Form>
              {prediction && (
                <div className="mt-4">
                  {prediction.error ? (
                    <p className="text-danger">{prediction.error}</p>
                  ) : (
                    <Row className="align-items-center">
                      <Col md={5} className="text-center">
                        <CircularProgressbar
                          value={prediction.aqi_pm25}
                          maxValue={500}
                          text={`${prediction.aqi_pm25}`}
                          styles={buildStyles({
                            pathColor: getAQIColor(prediction.aqi_pm25),
                            textColor: getAQIColor(prediction.aqi_pm25),
                            trailColor: '#d6d6d6',
                            textSize: '20px',
                          })}
                        />
                        {/* Category displayed below the circular graph */}
                        <p className="mt-2">
                          <strong>{prediction.category}</strong>
                        </p>
                      </Col>
                      <Col md={7}>
                        <h5 className="mb-3">AQI Details</h5>
                        <p>
                          <strong>Predicted PM2.5:</strong> {prediction.predicted_pm25.toFixed(2)} µg/m³
                        </p>
                      </Col>
                    </Row>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* AQI Trend Chart */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>AQI Trend (Last 7 Days)</Card.Title>
              <div className="trend-chart-container">
                <Line
                  data={aqiTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'bottom' } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
