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
            <PlanMealPage />
          </Route>
          <Route path="/listings">
            <PriceListingPage />
          </Route>
          <Route path="/adminlistings">
            <PriceListingAdminPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

class AppHeader extends React.Component {
  render() {
    return (
      <nav>
        <ul>
          <li><Link to={{
            pathname: '/',
            state: {token: this.props.token}
          }}>Meal Planner</Link></li>
          <li><Link to={{
            pathname: '/listings',
            state: {token: this.props.token}
          }}>Price Listings</Link></li>
        </ul>
      </nav>
    )
  }
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

class PlanMealPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: ''
    };
  }
  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    return (
      <div>
        <AppHeader token={this.state.token} />
        <p>NOTHING TO SEE HERE</p>
      </div>
    );
  }
}

class PriceListingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredientSuggestions: [],
      unitSuggestions: [],
      token: '',
      ingredientSearchTerm: '',
      unitSearchTerm: '',
      newIngredientName: '',
      newIngredientSource: '',
      newIngredientPrice: 0,
      newIngredientUnits: ''
    };
    this.searchIngredient = this.searchIngredient.bind(this);
    this.searchUnit = this.searchUnit.bind(this);
    this.fetchNeededPriceListing = this.fetchNeededPriceListing.bind(this);
    this.setPrice = this.setPrice.bind(this);
    this.selectUnits = this.selectUnits.bind(this);
    this.selectIngredient = this.selectIngredient.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.addPriceListing = this.addPriceListing.bind(this);
  }

  searchIngredient(e) {
    let searchTerm = e.target.value;
    this.setState({ingredientSearchTerm: searchTerm});
    if (!searchTerm) {
      this.setState({ingredientSuggestions: []});
      return;
    }

    axios({
      method: 'get',
      url: '/api/search/ingredient',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      params: {
        kw: searchTerm
      }
    }).then(response => {
      this.setState({ingredientSuggestions: response.data.results});
    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  searchUnit(e) {
    let searchTerm = e.target.value;
    this.setState({unitSearchTerm: searchTerm});
    if (!searchTerm) {
      this.setState({unitSuggestions: []});
      return;
    }

    axios({
      method: 'get',
      url: '/api/search/unit',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      params: {
        kw: searchTerm
      }
    }).then(response => {
      this.setState({unitSuggestions: response.data.results});
    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  fetchNeededPriceListing() {
    axios({
      method: 'get',
      url: '/api/pricelistings',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      }
    }).then(response => {
      this.setState({
        newIngredientName: response.data.ingredientName,
        ingredientSuggestions: []
      });
    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  selectIngredient(ingredientName) {
    this.setState({newIngredientName: ingredientName, ingredientSuggestions: []});
  }

  selectUnits(units) {
    this.setState({newIngredientUnits: units, unitSuggestions: []});
  }

  selectSource(e) {
    this.setState({newIngredientSource: e.target.value});
  }

  setPrice(e) {
    this.setState({newIngredientPrice: e.target.value});
  }

  addPriceListing(e) {
    if (e) {
      e.preventDefault();
    }

    let newListing = {
      ingredientName: this.state.newIngredientName,
      price: this.state.newIngredientPrice,
      source: this.state.newIngredientSource,
      units: this.state.newIngredientUnits
    };

    ['ingredientName', 'source', 'units'].forEach(field => {
      if (!newListing[field]) {
        this.setState({error: `Missing field: ${field}`});
        return;
      }
    });

    if (newListing.price < 0) {
      this.setState({error: 'Price cannot be negative'});
      return;
    }

    axios({
      method: 'post',
      url: '/api/pricelistings',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      data: newListing
    }).then(response => {
      this.setState({
        error: '',
        message: `Price for ${newListing.ingredientName} successfully added!`
      });
    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    let ingredientOptions;
    if (this.state.ingredientOptions) {
      ingredientOptions = (
        <ul>
          {this.ingredientSuggestions.map(name => (
            <li><button onClick={() => this.selectIngredient(name)}>{name}</button></li>
          ))}
        </ul>
      );
    } else {
      this.ingredientOptions = <div></div>;
    }

    let unitOptions;
    if (this.state.unitOptions) {
      unitOptions = (
        <ul>
        {this.unitSuggestions.map(unit => (
          <li><button onClick={() => this.selectUnits(unit)}>{unit}</button></li>
        ))}
        </ul>
      );
    } else {
      unitOptions = <div></div>;
    }

    let form;
    if (this.state.newIngredientName) {
      form = (
          <div>
          <form onSubmit={this.addPriceListing}>
            <p>{this.state.newIngredientName}</p>
            <input type="text" value={this.state.newIngredientSource} onChange={this.selectSource} />
            <input type="number" min="0" step="0.01" value={this.state.newIngredientPrice} onChange={this.setPrice}/>
            <p>{this.state.newIngredientUnits}</p>
            <input type="submit" value="Submit" />
          </form>
        </div>
      );
    } else {
      form = <div></div>;
    }

    return (
      <div>
      <AppHeader token={this.state.token} />
        <label htmlFor="searchIngredient">Search for an ingredient to add a price listing for:</label>
        <input id="searchIngredient" value={this.ingredientSearchTerm} onChange={this.searchIngredient}/>
        {ingredientOptions}
        <button onClick={this.fetchNeededPriceListing}>Choose for me</button>
        <label htmlFor="searchUnit">Select Units</label>
        <input id="searchUnit" value={this.unitSearchTerm} onChange={this.searchUnit} />
        {unitOptions}
        <hr />
        {form}
        {this.state.error}
      </div>
    );
  }
}

class PriceListingAdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      priceListings: [],
      token: ''
    };

    if (this.props.location) {
      this.setState({token: this.props.location.state.token});
    }

    this.fetchListings();
  }

  fetchListings() {
    axios({
      method: 'get',
      url: '/api/adminpricelistings',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      }
    }).then(response => {
      this.setState({priceListings: response.data.priceListings});
    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else if (error.status === 403) {
        // TODO: response for forbidden
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  updateListing(listing) {
    axios({
      method: 'post',
      url: '/api/adminpricelistings/update',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      data: {
        update: {
          ingredientName: listing.ingredientName,
          source: listing.source,
          timeCreated: listing.timeCreated
        },
        set: {
          price: listing.price
        }
      }
    }).then(response => {
      this.fetchListings();

    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else if (error.status === 403) {
        // TODO: forbidden response
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  deleteListing(listing) {
    axios({
      method: 'post',   // we could use delete, but eh
      url: '/api/adminpricelistings/delete',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      data: {
        ingredientName: listing.ingredientName,
        source: listing.source,
        timeCreated: listing.timeCreated
      }
    }).then(response => {
      this.fetchListings();

    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else if (error.status === 403) {
        // TODO: forbidden response
      } else {
        this.setState({error: error.data.error});
      }
    });
  }

  updateListingLocally(listing) {
    this.setState({priceListings: this.state.priceListings.map(l => {
      if (l.ingredientName === listing.ingredientName &&
        l.source === listing.source &&
        l.timeCreated === listing.timeCreated) {
        return {
          ingredientName: l.ingredientName,
          source: l.source,
          timeCreated: l.timeCreated,
          price: listing.price,
          units: listing.units
        };
      }

      return l;
    })});
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    // TODO: paginate
    const listings = this.state.priceListings.map(listing =>
      <tr key={`${listing.ingredientName}:${listing.source}:${listing.timeCreated}`}>
        <td>{listing.ingredientName}</td>
        <td>$<input type="number" min="0" step="0.01" value={listing.price} onChange={() => this.updateListingLocally(listing)} /></td>
        <td><input type="text" value={listing.units} onChange={() => this.updateListingLocally(listing)} /></td>
        <td>{listing.source}</td>
        <td>{listing.timeCreated}</td>
        <td><button onClick={() => this.updateListing(listing)}>Update</button></td>
        <td><button onClick={() => this.deleteListing(listing)}>X</button></td>
      </tr>
    );

    return (
      <div>
      <AppHeader token={this.state.token} />
        <table>
          {listings}
        </table>
        <p>{this.state.error}</p>
      </div>
    );
  }
}

ReactDOM.render(App(), document.getElementById("root"));
