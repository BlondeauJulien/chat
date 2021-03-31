import { Container } from 'react-bootstrap';

import AppoloProvider from './ApolloProvider';

import Register from './pages/Register';

import './App.scss';
import ApolloProvider from './ApolloProvider';

function App() {

	return (
    <ApolloProvider>
      <Container className="pt-5">
        <Register />
      </Container>
    </ApolloProvider>
	);
}

export default App;
