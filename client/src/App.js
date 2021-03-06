import { Container } from 'react-bootstrap';
import { BrowserRouter, Route, Switch} from 'react-router-dom';

import ApolloProvider from './ApolloProvider';
import './App.scss';

import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';


function App() {

	return (
    <ApolloProvider>
      <BrowserRouter>
        <Container className="pt-5">
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route path="/register" component={Register}></Route>
            <Route path="/login" component={Login}></Route>

          </Switch>

        </Container>
      </BrowserRouter>
    </ApolloProvider>
	);
}

export default App;
