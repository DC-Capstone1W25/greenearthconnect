import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; //
import { 
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client'; //
import { onError } from '@apollo/client/link/error'; //
import NavBar from './components/Navbar'; //
import Header from './components/Header'; //
import Footer from './components/Footer'; //
import DashboardScreen from './screens/DashboardScreen'; //
import MapScreen from './screens/MapScreen'; //
import NewsfeedScreen from './screens/NewsfeedScreen'; //
import NotFound from './components/NotFound'; //
import { Container } from 'react-bootstrap';

const port = process.env.PORT || 5000; //

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message }) => {
      console.log(message);
      return message;
    });
  }
}
);

const cache = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([
    errorLink,
    new HttpLink({
      uri: `http://localhost:${port}/graphql`,
    }),
  ]),
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([
    errorLink,
    new HttpLink({
      uri: `http://localhost:${port}/graphql`,
    }),
  ]),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="app-wrapper">
        <NavBar />
        <main className="py-3">
        <Container>

          <Routes>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/newsfeed" element={<NewsfeedScreen />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
          
        </Container>
        </main>
        <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
