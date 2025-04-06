// frontend/src/screens/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Image } from 'react-bootstrap';
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

// Helper function to decide AQI gauge color based on value
function getAQIColor(aqi) {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#99004C';
  return '#7E0023';
}

// Determine the base URL for the backend
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const baseURL = process.env.REACT_APP_BACKEND_URL || (isDev ? 'http://localhost:5000' : '');

// ===================================================
// RegressionSection Component
// ===================================================
function RegressionSection() {
  const [regressionResult, setRegressionResult] = useState(null);
  const [loadingRegression, setLoadingRegression] = useState(false);

  const handleRegressionAnalysis = async () => {
    setLoadingRegression(true);
    try {
      const endpoint = `${baseURL}/api/aqiRegress/regression`;
      const { data } = await axios.get(endpoint);
      setRegressionResult(data);
    } catch (error) {
      console.error('Error running regression analysis:', error);
      setRegressionResult({ error: 'Failed to run regression analysis' });
    }
    setLoadingRegression(false);
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title>Air Quality Regression Analysis</Card.Title>
        <Button variant="primary" onClick={handleRegressionAnalysis} disabled={loadingRegression}>
          {loadingRegression ? <Spinner animation="border" size="sm" /> : 'Run Regression Analysis'}
        </Button>
        {regressionResult && (
          <div className="mt-4">
            {regressionResult.error ? (
              <p className="text-danger">{regressionResult.error}</p>
            ) : (
              <>
                <h5>Best Model: {regressionResult.best_model}</h5>
                <h6>Model Performance:</h6>
                <ul>
                  {Object.entries(regressionResult.model_performance).map(([modelName, metrics]) => (
                    <li key={modelName}>
                      <strong>{modelName}</strong>: MAE: {metrics.MAE.toFixed(3)}, MSE: {metrics.MSE.toFixed(3)}, R2: {metrics.R2.toFixed(3)}
                    </li>
                  ))}
                </ul>
                <h6>AQI Category Distribution:</h6>
                <ul>
                  {Object.entries(regressionResult.aqi_category_distribution).map(([category, count]) => (
                    <li key={category}>
                      {category}: {count}
                    </li>
                  ))}
                </ul>
                <h6>Plots:</h6>
                <Row>
                  {regressionResult.plots &&
                    Object.entries(regressionResult.plots).map(([plotName, plotPath]) => (
                      <Col key={plotName} md={6} className="mb-3">
                        <Card>
                          <Image src={`${baseURL}${plotPath}`} alt={plotName} fluid />
                          <Card.Body>
                            <Card.Text>{plotName}</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

// ===================================================
// DashboardScreen Component
// ===================================================
export default function DashboardScreen() {
  // ---------- Dropdown Options from CSV ----------
  const genderOptions = ['Other', 'Female', 'Male'];
  const healthConditionOptions = ['Heart Issues', 'None', 'Asthma', 'Diabetes', 'Allergies'];
  const activityLevelOptions = ['Active', 'Sedentary', 'Moderate'];
  const preferenceOptions = ['Indoor', 'Outdoor', 'Social', 'Solo'];
  const communityEventOptions = ['Concert', 'Sports Event', 'None', 'Farmers Market'];
  const healthAdvisoryOptions = ['None', 'Heatwave', 'Flu Season', 'COVID-19 Alert'];

  // ---------- User Info ----------
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // ---------- Existing AQI Prediction (Gauge) State ----------
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [precipitation, setPrecipitation] = useState('');
  const [aqiPrediction, setAqiPrediction] = useState(null);
  const [loadingAqi, setLoadingAqi] = useState(false);

  // ---------- Capstone Forecast (Line Chart) State ----------
  const [forecastStart, setForecastStart] = useState('');
  const [forecastEnd, setForecastEnd] = useState('');
  const [capstoneForecast, setCapstoneForecast] = useState(null);
  const [loadingCapstone, setLoadingCapstone] = useState(false);
  const [forecastChartData, setForecastChartData] = useState(null);

  // ---------- Basic Activity Recommendation (v1) State ----------
  const [activityAge, setActivityAge] = useState('');
  const [activityTimeOfDay, setActivityTimeOfDay] = useState('');
  const [activityAQI, setActivityAQI] = useState('');
  const [activityTemperature, setActivityTemperature] = useState('');
  const [activityPrecipitation, setActivityPrecipitation] = useState('');
  const [recommendedActivity, setRecommendedActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // ---------- Advanced Activity Recommendation (v2) State ----------
  const [v2ActivityAge, setV2ActivityAge] = useState('');
  const [v2ActivityGender, setV2ActivityGender] = useState('');
  const [v2ActivityHealthCondition, setV2ActivityHealthCondition] = useState('');
  const [v2ActivityLevel, setV2ActivityLevel] = useState('');
  const [v2ActivityPreference, setV2ActivityPreference] = useState('');
  const [v2ActivityTemperature, setV2ActivityTemperature] = useState('');
  const [v2ActivityHumidity, setV2ActivityHumidity] = useState('');
  const [v2ActivityWindSpeed, setV2ActivityWindSpeed] = useState('');
  const [v2ActivityAirQualityIndex, setV2ActivityAirQualityIndex] = useState('');
  const [v2ActivityCrimeRate, setV2ActivityCrimeRate] = useState('');
  const [v2ActivityTrafficCongestionIndex, setV2ActivityTrafficCongestionIndex] = useState('');
  const [v2ActivityCommunityEvent, setV2ActivityCommunityEvent] = useState('');
  const [v2ActivityHealthAdvisory, setV2ActivityHealthAdvisory] = useState('');
  const [recommendedActivityV2, setRecommendedActivityV2] = useState(null);
  const [loadingActivityV2, setLoadingActivityV2] = useState(false);

  // ---------- Handler for existing AQI prediction ----------
  const handleAqiPredict = async () => {
    setLoadingAqi(true);
    try {
      const endpoint = `${baseURL}/api/aqi/predict`;
      const { data } = await axios.get(endpoint, {
        params: {
          temperature,
          humidity,
          wind_speed: windSpeed,
          precipitation,
        },
      });
      setAqiPrediction(data);
    } catch (error) {
      console.error('Error fetching AQI prediction:', error);
      setAqiPrediction({ error: 'Failed to fetch prediction' });
    }
    setLoadingAqi(false);
  };

  // ---------- Handler for capstone forecast prediction ----------
  const handleCapstonePredict = async () => {
    setLoadingCapstone(true);
    try {
      const endpoint = `${baseURL}/api/aqi/capstone/predict`;
      const { data } = await axios.get(endpoint, {
        params: {
          forecast_start: forecastStart,
          forecast_end: forecastEnd,
        },
      });
      setCapstoneForecast(data);
    } catch (error) {
      console.error('Error fetching capstone forecast:', error);
      setCapstoneForecast({ error: 'Failed to fetch forecast' });
    }
    setLoadingCapstone(false);
  };

  // ---------- Handler for basic activity recommendation (v1) ----------
  const handleActivityRecommend = async () => {
    setLoadingActivity(true);
    try {
      const endpoint = `${baseURL}/api/activity/recommend`;
      const { data } = await axios.get(endpoint, {
        params: {
          age: activityAge,
          time_of_day: activityTimeOfDay,
          aqi: activityAQI,
          temperature: activityTemperature,
          precipitation: activityPrecipitation,
        },
      });
      setRecommendedActivity(data);
    } catch (error) {
      console.error('Error fetching activity recommendation:', error);
      setRecommendedActivity({ error: 'Failed to fetch recommendation' });
    }
    setLoadingActivity(false);
  };

  // ---------- Handler for advanced activity recommendation (v2) ----------
  const handleActivityRecommendV2 = async () => {
    setLoadingActivityV2(true);
    try {
      const endpoint = `${baseURL}/api/activity/v2/recommend`;
      const { data } = await axios.get(endpoint, {
        params: {
          age: v2ActivityAge,
          gender: v2ActivityGender,
          health_condition: v2ActivityHealthCondition,
          activity_level: v2ActivityLevel,
          preference: v2ActivityPreference,
          temperature: v2ActivityTemperature,
          humidity: v2ActivityHumidity,
          wind_speed: v2ActivityWindSpeed,
          air_quality_index: v2ActivityAirQualityIndex,
          crime_rate: v2ActivityCrimeRate,
          traffic_congestion_index: v2ActivityTrafficCongestionIndex,
          community_event: v2ActivityCommunityEvent,
          health_advisory: v2ActivityHealthAdvisory,
        },
      });
      setRecommendedActivityV2(data);
    } catch (error) {
      console.error('Error fetching v2 activity recommendation:', error);
      setRecommendedActivityV2({ error: 'Failed to fetch v2 recommendation' });
    }
    setLoadingActivityV2(false);
  };

  // ---------- Build chart data from capstone forecast result ----------
  useEffect(() => {
    if (capstoneForecast && capstoneForecast.forecast) {
      const labels = capstoneForecast.forecast.map((item) => item.date);
      const data = capstoneForecast.forecast.map((item) => item.predicted_NO2);
      setForecastChartData({
        labels,
        datasets: [
          {
            label: 'Predicted NO₂ Levels',
            data,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    }
  }, [capstoneForecast]);

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center">
            {username
              ? `Welcome, ${username}, to your dashboard!`
              : 'Welcome to your dashboard!'}
          </p>
        </Col>
      </Row>

      {/* AQI Prediction and Capstone Forecast Sections */}
      <Row>
        {/* Existing AQI Prediction (Gauge) */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>AQI Prediction (Random Forest)</Card.Title>
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
                <Button variant="primary" onClick={handleAqiPredict} disabled={loadingAqi}>
                  {loadingAqi ? <Spinner animation="border" size="sm" /> : 'Get AQI Prediction'}
                </Button>
              </Form>
              {aqiPrediction && (
                <div className="mt-4 text-center">
                  {aqiPrediction.error ? (
                    <p className="text-danger">{aqiPrediction.error}</p>
                  ) : (
                    <>
                      <CircularProgressbar
                        value={aqiPrediction.aqi_pm25}
                        maxValue={500}
                        text={`${aqiPrediction.aqi_pm25}`}
                        styles={buildStyles({
                          pathColor: getAQIColor(aqiPrediction.aqi_pm25),
                          textColor: getAQIColor(aqiPrediction.aqi_pm25),
                          trailColor: '#d6d6d6',
                          textSize: '20px',
                        })}
                      />
                      <p className="mt-2">
                        <strong>{aqiPrediction.category}</strong>
                      </p>
                      <p>
                        <strong>Predicted PM2.5:</strong> {aqiPrediction.predicted_pm25?.toFixed(2)} µg/m³
                      </p>
                    </>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Capstone Forecast (Line Chart) */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Capstone Air Quality Forecast (XGBoost)</Card.Title>
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formForecastStart">
                      <Form.Label>Forecast Start (YYYY-MM-DD)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., 2024-11-30"
                        value={forecastStart}
                        onChange={(e) => setForecastStart(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formForecastEnd">
                      <Form.Label>Forecast End (YYYY-MM-DD)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., 2025-11-01"
                        value={forecastEnd}
                        onChange={(e) => setForecastEnd(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" onClick={handleCapstonePredict} disabled={loadingCapstone}>
                  {loadingCapstone ? <Spinner animation="border" size="sm" /> : 'Get Forecast'}
                </Button>
              </Form>
              {capstoneForecast && capstoneForecast.error && (
                <p className="text-danger mt-3">{capstoneForecast.error}</p>
              )}
              {forecastChartData && (
                <div style={{ height: '400px', marginTop: '1rem' }}>
                  <Line
                    data={forecastChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Forecasted NO₂ Levels' },
                      },
                      scales: {
                        x: { title: { display: true, text: 'Date' } },
                        y: { title: { display: true, text: 'NO₂ Concentration' } },
                      },
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Basic Activity Recommendation (v1) Section */}
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Activity Recommendation (Basic)</Card.Title>
              <Form>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="formActivityAge">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 30"
                        value={activityAge}
                        onChange={(e) => setActivityAge(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formActivityTimeOfDay">
                      <Form.Label>Time of Day</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., 8"
                        value={activityTimeOfDay}
                        onChange={(e) => setActivityTimeOfDay(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="formActivityAQI">
                      <Form.Label>AQI</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 45"
                        value={activityAQI}
                        onChange={(e) => setActivityAQI(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formActivityTemperature">
                      <Form.Label>Temperature (°F)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 70"
                        value={activityTemperature}
                        onChange={(e) => setActivityTemperature(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formActivityPrecipitation">
                      <Form.Label>Precipitation</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 0"
                        value={activityPrecipitation}
                        onChange={(e) => setActivityPrecipitation(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" onClick={handleActivityRecommend} disabled={loadingActivity}>
                  {loadingActivity ? <Spinner animation="border" size="sm" /> : 'Get Basic Activity Recommendation'}
                </Button>
              </Form>
              {recommendedActivity && (
                <div className="mt-4 text-center">
                  {recommendedActivity.error ? (
                    <p className="text-danger">{recommendedActivity.error}</p>
                  ) : (
                    <h4>Recommended Activity: {recommendedActivity.recommended_activity}</h4>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Advanced Activity Recommendation (v2) Section */}
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Activity Recommendation (Advanced)</Card.Title>
              <Form>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityAge">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 30"
                        value={v2ActivityAge}
                        onChange={(e) => setV2ActivityAge(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityGender">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        value={v2ActivityGender}
                        onChange={(e) => setV2ActivityGender(e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityHealthCondition">
                      <Form.Label>Health Condition</Form.Label>
                      <Form.Select
                        value={v2ActivityHealthCondition}
                        onChange={(e) => setV2ActivityHealthCondition(e.target.value)}
                      >
                        <option value="">Select Health Condition</option>
                        {healthConditionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityLevel">
                      <Form.Label>Activity Level</Form.Label>
                      <Form.Select
                        value={v2ActivityLevel}
                        onChange={(e) => setV2ActivityLevel(e.target.value)}
                      >
                        <option value="">Select Activity Level</option>
                        {activityLevelOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityPreference">
                      <Form.Label>Preference</Form.Label>
                      <Form.Select
                        value={v2ActivityPreference}
                        onChange={(e) => setV2ActivityPreference(e.target.value)}
                      >
                        <option value="">Select Preference</option>
                        {preferenceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityTemperature">
                      <Form.Label>Temperature (°F)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 70"
                        value={v2ActivityTemperature}
                        onChange={(e) => setV2ActivityTemperature(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityHumidity">
                      <Form.Label>Humidity (%)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 55"
                        value={v2ActivityHumidity}
                        onChange={(e) => setV2ActivityHumidity(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityWindSpeed">
                      <Form.Label>Wind Speed (mph)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 10"
                        value={v2ActivityWindSpeed}
                        onChange={(e) => setV2ActivityWindSpeed(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityAirQualityIndex">
                      <Form.Label>Air Quality Index</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 50"
                        value={v2ActivityAirQualityIndex}
                        onChange={(e) => setV2ActivityAirQualityIndex(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityCrimeRate">
                      <Form.Label>Crime Rate</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 20"
                        value={v2ActivityCrimeRate}
                        onChange={(e) => setV2ActivityCrimeRate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityTrafficCongestionIndex">
                      <Form.Label>Traffic Congestion Index</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="e.g., 35"
                        value={v2ActivityTrafficCongestionIndex}
                        onChange={(e) => setV2ActivityTrafficCongestionIndex(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityCommunityEvent">
                      <Form.Label>Community Event</Form.Label>
                      <Form.Select
                        value={v2ActivityCommunityEvent}
                        onChange={(e) => setV2ActivityCommunityEvent(e.target.value)}
                      >
                        <option value="">Select Community Event</option>
                        {communityEventOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group controlId="v2ActivityHealthAdvisory">
                      <Form.Label>Health Advisory</Form.Label>
                      <Form.Select
                        value={v2ActivityHealthAdvisory}
                        onChange={(e) => setV2ActivityHealthAdvisory(e.target.value)}
                      >
                        <option value="">Select Health Advisory</option>
                        {healthAdvisoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" onClick={handleActivityRecommendV2} disabled={loadingActivityV2}>
                  {loadingActivityV2 ? <Spinner animation="border" size="sm" /> : 'Get Advanced Activity Recommendation'}
                </Button>
              </Form>
              {recommendedActivityV2 && (
                <div className="mt-4 text-center">
                  {recommendedActivityV2.error ? (
                    <p className="text-danger">{recommendedActivityV2.error}</p>
                  ) : (
                    <h4>Recommended Activity: {recommendedActivityV2.recommended_activity}</h4>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =================================================== */}
      {/* Regression Analysis Section */}
      {/* =================================================== */}
      <RegressionSection />
    </Container>
  );
}
