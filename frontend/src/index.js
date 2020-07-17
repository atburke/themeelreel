import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import './index.css';
import axios from 'axios';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/newaccount">
            <CreateAccountPage />
          </Route>
          <Route path="/">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
    if (this.props.location) {
      this.setState({token: this.props.location.state.token});
    }

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    axios({
      method: 'get',
      url: '/api/login',
      auth: {
        username: this.state.username,
        password: this.state.password
      }
    }).then(response => {
      this.setState({redirect: '/', token: response.data.token});
    }).catch(error => {
      this.setState({error: error.statusText});
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    let errorMessage = this.state.error ? <p>{this.state.error}</p> : <p></p>;
    return (
      <div>
      <p>Don't have an account? <Link to="/newaccount">Sign up</Link></p>
      {errorMessage}
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={this.state.username} onChange={this.handleUsernameChange} />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={this.state.password} onChange={this.handlePasswordChange} />
          <input type="submit" value="Log in" />
        </form>
      </div>
    );
  }
}

class CreateAccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password1: '',
      password2: ''
    };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePassword1Change = this.handlePassword1Change.bind(this);
    this.handlePassword2Change = this.handlePassword2Change.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  handlePassword1Change(event) {
    this.setState({password1: event.target.value});
  }

  handlePassword2Change(event) {
    this.setState({password2: event.target.value});
    if (this.state.password1 !== this.state.password2) {
      this.setState({smallError: 'Passwords must match'});
    } else {
      this.setState({smallError: ''});
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.username) {
      this.setState({smallError: 'No username provided'});
      return;
    }

    if (this.state.password1 !== this.state.password2) {
      this.setState({smallError: 'Passwords must match'});
      return;
    }

    if (!this.state.password1) {
      this.setState({smallError: 'No password provided'});
      return;
    }

    axios({
      method: 'post',
      url: '/api/createaccount',
      data: {
        username: this.state.username,
        password: this.state.password
      }
    }).then(response => {
      this.setState({redirect: '/', token: response.data.token});
    }).catch(error => {
      this.setState({error: error.statusText});
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    let errorMessage = this.state.error ? <p>{this.state.error}</p> : <p></p>;
    let smallErrorMessage = this.state.smallError ? <p>{this.state.smallError}</p> : <p></p>;
    return (
      <div>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
      {errorMessage}
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={this.state.username} onChange={this.handleUsernameChange} />
          <label htmlFor="password1">Password</label>
          <input type="password" id="password1" value={this.state.password1} onChange={this.handlePassword1Change} />
          <label htmlFor="password2">Retype Password</label>
          <input type="password" id="password2" value={this.state.password2} onChange={this.handlePassword2Change} />
          <input type="submit" value="Create account" />
        </form>
      {smallErrorMessage}
      </div>
    );
  }
}

/*
class PlanMealPage extends React.Component {
  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />
    }
  }
}
*/

/*
class PriceListingPage extends React.Component {
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
  }
}
*/

/*
class PriceListingAdminPage extends React.Component {
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
  }
}
*/

ReactDOM.render(App(), document.getElementById("root"));
