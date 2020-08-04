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
import _ from 'lodash';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/newaccount" component={CreateAccountPage} />
          <Route exact path="/newplan" component={PlanMealPage} />
          <Route exact path="/" component={HomePage} />
          <Route exact path="/listings" component={PriceListingPage} />
          <Route exact path="/adminlistings" component={PriceListingAdminPage} />
        </Switch>
      </div>
    </Router>
  );
}

class AppHeader extends React.Component {
  constructor(props) {
    super(props);

    this.toHome = this.toHome.bind(this);
    this.toListings = this.toListings.bind(this);
    this.toMealPlanner = this.toMealPlanner.bind(this);
    this.toAdminListings = this.toAdminListings.bind(this);
    this.logout = this.logout.bind(this);

    this.state = {
      redirect: ''
    };
  }

  toHome(e) {
    e.preventDefault();
    this.followLink("/");
  }

  toListings(e) {
    e.preventDefault();
    this.followLink("/listings");
  }

  toMealPlanner(e) {
    e.preventDefault();
    this.followLink("/newplan");
  }

  toAdminListings(e) {
    e.preventDefault();
    this.followLink("/adminlistings")
  }

  logout(e) {
    e.preventDefault();
    this.followLink("/login");
  }

  followLink(route) {
    console.log(`redirecting to ${route}`)
    if (route !== this.props.here) {
      this.setState({redirect: route});
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.props.token}
      }} />;
    }

    return (
      <div>
        <div class="pb-2 mt-4 mb-2 border-bottom">
          <h1>The MeelReel</h1>
        </div>
        <nav class="nav nav-tabs">
          <a class="nav-link" href="/" onClick={this.toHome}>Home</a>
          <a class="nav-link" href="/newplan" onClick={this.toMealPlanner}>New Meal Plan</a>
          <a class="nav-link" href="/listings" onClick={this.toListings}>Listings</a>
          <a class="nav-link" href="/adminlistings" onClick={this.toAdminListings}>Admin listings</a>
          <a class="nav-link" href="/login" onClick={this.logout}>Log out</a>
        </nav>
      </div>
    )
  }
}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      redirect: '',
      token: ''
    };
    if (this.props.location.state && this.props.location.state.token) {
      this.state.token = this.props.location.state.token;
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
      console.log("logged in!");
      this.setState({redirect: '/', token: response.data.token});
    }).catch(error => {
      console.log(error.data);
      this.setState({error: error.statusText});
    });
  }

  render() {
    if (this.state.redirect) {
      console.log(`redirecting to ${this.state.redirect}`);
      return <Redirect to={{
        pathname: this.state.redirect,
        state: { token: this.state.token }
      }} />;
    }

    let errorMessage = this.state.error ? <p>{this.state.error}</p> : <p></p>;
    return (
      <div>
      <p>Don't have an account? <Link to="/newaccount">Sign up</Link></p>
      {errorMessage}
        <form onSubmit={this.handleSubmit}>
          <div class="form-row">
            <div class="col-md-6">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" class="form-control" value={this.state.username} onChange={this.handleUsernameChange} />
            </div>
            <div class="col-md-6">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" class="form-control" value={this.state.password} onChange={this.handlePasswordChange} />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Log in</button>
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
      password2: '',
      redirect: ''
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
    let pw2 = event.target.value;
    this.setState((state, props) => {
      let smallError = state.password1 !== pw2 ? 'Passwords must match' : '';

      return {
        password2: pw2,
        smallError: smallError
      };
    });
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
      method: 'get',
      url: '/api/createaccount',
      auth: {
        username: this.state.username,
        password: this.state.password1
      }
    }).then(response => {
      console.log("redirecting to /")
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
          <div class="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" class="form-control" value={this.state.username} onChange={this.handleUsernameChange} />
          </div>
          <div class="form-group">
            <label htmlFor="password1">Password</label>
            <input type="password" id="password1" class="form-control" value={this.state.password1} onChange={this.handlePassword1Change} />
          </div>
          <div class="form-group">
            <label htmlFor="password2">Retype Password</label>
            <input type="password" id="password2" class="form-control" value={this.state.password2} onChange={this.handlePassword2Change} />
          </div>
          <button type="submit" class="btn btn-primary">Create account</button>
        </form>
      {smallErrorMessage}
      </div>
    );
  }
}

function Meal(props) {
  return (
    <div class="card">
      <img class="card-img-top" src={props.imageURL} alt={props.name}/>
      <div class="card-body">
        <h5 class="card-title">{props.name}</h5>
        <div class="container">
          <p class="card-text row">
            <div class="col">Calories: {props.calories}</div>
            <div class="col">Cost: ${props.cost}</div>
          </p>
        </div>
        <a href={props.recipeURL} class="btn btn-link">View Recipe</a>
      </div>
    </div>
  );
}

function DayPlan(props) {
  return (
    <ul class="list-group">
      {props.meals.map((meal, index) => (
        <li key={index} class="list-group-item"><Meal name={meal.name} imageURL={meal.imageURL} recipeURL={meal.recipeURL} cost={meal.cost} calories={meal.calories}/></li>
      ))}
    </ul>
  );
}

function MealPlan(props) {
  return (
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{props.name}</h5>
        <div class="container">
          <p class="card-text row">
            <div>Created {props.timeCreated}</div>
            <div>Cost: ${props.totalCost}</div>
            <div>Total Calories: {props.totalCalories} ({props.totalCalories / props.recipes.length} calories per day)</div>
          </p>
        </div>
        <hr />
        <div class="d-flex flex-wrap">
          {props.recipes.map((dayPlan, index) => (
            <div key={index}>
              <DayPlan meals={dayPlan}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      redirect: '',
      error: '',
      mealPlans: []
    };

    if (this.props.location.state && this.props.location.state.token) {
      this.state.token = this.props.location.state.token;
    } else {
      this.state.redirect = '/login';
    }

    this.fetchMealPlans();
  }

  fetchMealPlans() {
    axios({
      method: 'get',
      url: '/api/mealplan',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      }
    }).then(response => {
      this.setState({mealPlans: response.data.results});
    }).catch(error => {
      this.setState({error: error.data.error});
    });
  }

  deleteMealPlan(id) {
    axios({
      method: 'delete',
      url: '/api/mealplan',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      data: {
        id: id
      }
    }).then(response => {
      this.fetchMealPlans();
    }).catch(error => {
      this.setState({error: error.data.error});
    })
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
      <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <h3>Your existing meal plans:</h3>
        <ul class="list-group list-group-flush">
        {this.state.mealPlans.map(plan => (
          <li key={plan.id} class="list-group-item">
            <MealPlan name={plan.name} timeCreated={plan.timeCreated} totalCost={plan.totalCost} totalCalories={plan.totalCalories} recipes={plan.recipes}/>
            <br />
            <a class="btn btn-link" href="/api/mealplan/{plan.id}.pdf" download>Download</a>
            <button class="btn btn-danger" onClick={() => this.deleteMealPlan(plan.id)}>Delete</button>
          </li>
        ))}
        </ul>
      </div>
    );
  }
}

class PlanMealPage extends React.Component {
  constructor(props) {
    console.log("constructing plan meal page");
    super(props);
    this.state = {
      token: '',
      redirect: '',
      error: '',
      msg: '',
      budget: 0,
      days: 0,
      dailyCalories: 0,
      title: '',
      minIngredients: [],
      maxIngredients: [],
      newIngredient: '',
      newAmount: 0,
      newUnits: '',
      ingredientSearchResults: [],
      unitSearchResults: []
    };

    if (this.props.location.state && this.props.location.state.token) {
      this.state.token = this.props.location.state.token;
    } else {
      this.state.redirect = '/login';
    }

    this.submitPlan = this.submitPlan.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setBudget = this.setBudget.bind(this);
    this.setCalories = this.setCalories.bind(this);
    this.setDays = this.setDays.bind(this);
    this.updateIngredientSearch = this.updateIngredientSearch.bind(this);
    this.updateUnitSearch = this.updateUnitSearch.bind(this);
    this.addMinIngredient = this.addMinIngredient.bind(this);
    this.deleteMinIngredient = this.deleteMinIngredient.bind(this);
    this.addMaxIngredient = this.addMaxIngredient.bind(this);
    this.deleteMaxIngredient = this.deleteMaxIngredient.bind(this);
    this.setIngredient = this.setIngredient.bind(this);
    this.setUnits = this.setUnits.bind(this);
    this.setAmount = this.setAmount.bind(this);
  }

  setTitle(e) {
    this.setState({title: e.target.value});
  }

  setBudget(e) {
    this.setState({budget: e.target.value});
  }

  setCalories(e) {
    this.setState({calories: e.target.value});
  }

  setDays(e) {
    this.setState({days: e.target.value});
  }

  setIngredient(ingredientName) {
    this.setState({newIngredient: ingredientName, ingredientSearchResults: []});
  }

  setUnits(units) {
    this.setState({newUnits: units, unitSearchResults: []});
  }

  setAmount(e) {
    this.setState({newAmount: e.target.value});
  }

  updateIngredientSearch(e) {
    let kw = e.target.value;
    axios({
      method: 'get',
      url: '/api/search/ingredient',
      params: {
        kw: kw
      },
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      }
    }).then(response => {
      this.setState({ingredientSearchResults: response.data.results});
    });
  }

  updateUnitSearch(e) {
    let kw = e.target.value;
    axios({
      method: 'get',
      url: '/api/search/unit',
      params: {
        kw: kw
      },
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      }
    }).then(response => {
      this.setState({unitSearchResults: response.data.results});
    });
  }

  addMinIngredient() {
    if (!this.state.minIngredients.some(e => e.name === this.state.newIngredient)) {
      this.setState((state, props) => {
        state.minIngredients.push({
          name: state.newIngredient,
          amount: state.newAmount,
          units: state.newUnits
        });
        return {minIngredients: state.minIngredients};
      });
    }
  }

  deleteMinIngredient(ingredientName) {
    console.log(`deleting ${ingredientName} from min`);
    console.log(this.state.minIngredients);
    this.setState((state, props) => {
      let newMin = state.minIngredients.filter(i => i.name !== ingredientName);
      return {minIngredients: newMin};
    });
  }

  addMaxIngredient() {
    if (!this.state.minIngredients.some(e => e.name === this.state.newIngredient)) {
      this.setState((state, props) => {
        state.maxIngredients.push({
          name: state.newIngredient,
          amount: state.newAmount,
          units: state.newUnits
        });
        return {maxIngredients: state.maxIngredients};
      });
    }
  }

  deleteMaxIngredient(ingredientName) {
    console.log(`deleting ${ingredientName} from max`);
    console.log(this.state.maxIngredients);
    this.setState((state, props) => {
      let newMax = state.maxIngredients.filter(i => i.name !== ingredientName);
      return {maxIngredients: newMax};
    });
  }

  submitPlan(e) {
    e.preventDefault();
    let message = {
      budget: this.state.budget,
      dailyCalories: this.state.dailyCalories,
      days: this.state.days,
      title: this.state.title,
      minIngredients: this.state.minIngredients,
      maxIngredients: this.state.maxIngredients
    };

    axios({
      method: 'post',
      url: '/api/mealplan',
      headers: {
        'Authorization': `Basic ${this.state.token}`
      },
      data: message
    }).then(response => {
      this.setState({msg: response.data.msg});
    }).catch(error => {
      this.setState({error: error.data.error});
    });
  }

  render() {
    console.log("rendering plan meal page");
    if (this.state.redirect) {
      console.log("redirecting")
      return <Redirect to={{
        pathname: this.state.redirect,
        state: { token: this.state.token }
      }} />;
    }

    let mins = this.state.minIngredients.map(ing => (
      <li key={ing.name} class="list-group-item">
        <div key={ing.name} class="card">
          <div class="card-body">
            <p>{ing.name}: {ing.amount} {ing.units}</p>
            <button class="btn btn-danger" onClick={() => this.deleteMinIngredient(ing.name)}>X</button>
          </div>
        </div>
      </li>
    ));

    let maxs = this.state.maxIngredients.map(ing => (
      <li key={ing.name} class="list-group-item">
        <div class="card">
          <div class="card-body">
            <p class="card-text">{ing.name}: {ing.amount} {ing.units}</p>
            <button class="btn btn-danger" onClick={() => this.deleteMaxIngredient(ing.name)}>X</button>
          </div>
        </div>
      </li>
    ));

    return (
      <div>
        <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <h3>Generate a new meal plan</h3>
        <div>
          <div class="row">
            <div class="form-group col-md-6">
              <label htmlFor="title">Title (optional)</label>
              <input id="title" type="text" class="form-control" value={this.state.title} onChange={this.setTitle} />
            </div>
            <div class="form-group col-md-6">
              <label htmlFor="budget">Budget</label>
              $<input id="budget" type="number" min="0" step="0.01" class="form-control" value={this.state.budget} onChange={this.setBudget} />
            </div>
            <div class="form-group col-md-6">
              <label htmlFor="calories">Daily Calories</label>
              <input id="calories" type="number" min="0" class="form-control" value={this.state.calories} onChange={this.setCalories} />
            </div>
            <div class="form-group col-md-6">
              <label htmlFor="days">Days</label>
              <input id="days" type="number" min="1" max="31" class="form-control" value={this.state.days} onChange={this.setDays} />
            </div>
          </div>
          <hr />
          <div class="row">
            <div class="col-6">
              <h4>Minimum Ingredients</h4>
              <ul class="list-group">
                {mins}
              </ul>
            </div>
            <div class="col-6">
              <h4>Maximum Ingredients</h4>
              <ul class="list-group">
                {maxs}
              </ul>
            </div>
          </div>
          <hr />
          <div class="form-group">
            <label htmlFor="search-ingr">Ingredient</label>
            <input id="search-ingr" class="form-control" type="text" onChange={this.updateIngredientSearch} />
          </div>
          <ul class="list-group list-group-horizontal">
            {this.state.ingredientSearchResults.map(name => (
              <li key={name} class="list-group-item"><button class="btn btn-secondary" onClick={() => this.setIngredient(name)}>{name}</button></li>
            ))}
          </ul>
          <div class="form-group">
            <label htmlFor="search-unit">Unit</label>
            <input id="search-unit" class="list-group-item" type="text" onChange={this.updateUnitSearch} />
          </div>
          <ul class="list-group list-group-horizontal">
            {this.state.unitSearchResults.map(name => (
              <li key={name} class="list-group-item"><button class="btn btn-secondary" onClick={() => this.setUnits(name)}>{name}</button></li>
            ))}
          </ul>
          <hr />
          <div class="form-row">
            <div class="col-3">{this.state.newIngredient}: </div>
            <input id="amount" class="form-control col-8" type="number" min="0" step="0.01" value={this.state.newAmount} onChange={this.setAmount} />
            <div class="col-1">{this.state.newUnits}</div>
          </div>
          <div class="form-group">
            <button class="btn btn-dark" onClick={this.addMinIngredient}>Add as minimum</button>
            <button class="btn btn-light" onClick={this.addMaxIngredient}>Add as maximum</button>
          </div>
          <button class="btn btn-primary" onClick={this.submitPlan}>Create Plan</button>
        </div>
      </div>
    );
  }
}

class PriceListingPage extends React.Component {
  constructor(props) {
    console.log("constructing price listings");
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
      newIngredientUnits: '',
      redirect: ''
    };

    if (this.props.location.state && this.props.location.state.token) {
      this.state.token = this.props.location.state.token;
    } else {
      this.state.redirect = '/login';
    }

    this.searchIngredient = this.searchIngredient.bind(this);
    this.searchUnit = this.searchUnit.bind(this);
    this.fetchNeededPriceListing = this.fetchNeededPriceListing.bind(this);
    this.setPrice = this.setPrice.bind(this);
    this.setAmount = this.setAmount.bind(this);
    this.selectUnits = this.selectUnits.bind(this);
    this.selectIngredient = this.selectIngredient.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.addPriceListing = this.addPriceListing.bind(this);
  }

  searchIngredient(e) {
    let searchTerm = e.target.value;

    this.setState({ingredientSearchTerm: searchTerm}, () => {
      if (!this.searchIngredientFn) {
        this.searchIngredientFn = _.debounce(() => {
          if (!this.state.ingredientSearchTerm) {
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
              kw: this.state.ingredientSearchTerm
            }
          }).then(response => {
            console.log(response.data);
            this.setState({ingredientSuggestions: response.data.results});
          }).catch(error => {
            if (error.status === 401) {
              this.setState({redirect: '/login'});
            } else {
              this.setState({error: error.data.error});
            }
          });
        },   400  );
      }

      this.searchIngredientFn();
    });

  }

  searchUnit(e) {
    let searchTerm = e.target.value;

    this.setState({unitSearchTerm: searchTerm}, () => {
      if (!this.searchUnitFn) {
        this.searchUnitFn = _.debounce(() => {
          if (!this.state.unitSearchTerm) {
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
              kw: this.state.unitSearchTerm
            }
          }).then(response => {
            console.log(response.data);
            this.setState({unitSuggestions: response.data.results});
          }).catch(error => {
            if (error.status === 401) {
              this.setState({redirect: '/login'});
            } else {
              this.setState({error: error.data.error});
            }
          });
        },   400  );
      }

      this.searchUnitFn();
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
      console.log(response.data);
      this.setState({
        newIngredientName: response.data.result,
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

  setAmount(e) {
    this.setState({newIngredientAmount: e.target.value});
  }

  addPriceListing(e) {
    if (e) {
      e.preventDefault();
    }

    let newListing = {
      ingredientName: this.state.newIngredientName,
      price: this.state.newIngredientPrice,
      amount: this.state.newIngredientAmount,
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

    if (newListing.amount && newListing.amount < 0) {
      this.setState({error: 'Amount cannot be negative'});
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
    if (this.state.ingredientSuggestions) {
      ingredientOptions = (
        <ul class="list-group list-group-horizontal">
          {this.state.ingredientSuggestions.map(name => (
            <li key={name} class="list-group-item"><button class="btn btn-secondary" onClick={() => this.selectIngredient(name)}>{name}</button></li>
          ))}
        </ul>
      );
    } else {
      this.ingredientOptions = '';
    }

    let unitOptions;
    if (this.state.unitSuggestions) {
      unitOptions = (
        <ul class="list-group list-group-horizontal">
        {this.state.unitSuggestions.map(unit => (
          <li key={unit} class="list-group-item"><button class="btn btn-secondary" onClick={() => this.selectUnits(unit)}>{unit}</button></li>
        ))}
        </ul>
      );
    } else {
      unitOptions = '';
    }

    let form;
    if (this.state.newIngredientName && this.state.newIngredientUnits) {
      form = (
        <div>
          <form onSubmit={this.addPriceListing}>
            <h5>{this.state.newIngredientName}</h5>
            <div>
              <div class="form-group">
                <label htmlFor="source">Source</label>
                <input type="text" class="form-control" id="source" value={this.state.newIngredientSource} onChange={this.selectSource} />
              </div>
              <div class="form-group">
                <label htmlFor="price">Price ($): </label>
                <input type="number" class="form-control" id="price" min="0" step="0.01" value={this.state.newIngredientPrice} onChange={this.setPrice}/>
              </div>
              <div class="form-group">
                <label htmlFor="amount">Amount ({this.state.newIngredientUnits})</label>
                <input type="number" class="form-control" id="amount" min="0" step="0.01" value={this.state.newIngredientAmount} onChange={this.setAmount}/>
            </div>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
        </div>
      );
    } else {
      form = '';
    }

    return (
      <div>
        <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <div>
          <div class="form-group">
            <label htmlFor="searchIngredient">Search for an ingredient to add a price listing for:</label>
            <input id="searchIngredient" class="form-control" value={this.ingredientSearchTerm} onChange={this.searchIngredient}/>
            <button class="btn btn-info" onClick={this.fetchNeededPriceListing}>Choose for me</button>
          </div>
          {ingredientOptions}
          <div class="form-group">
            <label htmlFor="searchUnit">Select Units</label>
            <input id="searchUnit" class="form-control" value={this.unitSearchTerm} onChange={this.searchUnit} />
          </div>
          {unitOptions}
        </div>
        <br />
        <div class="row">
          <p class="col">New ingredient: {this.state.newIngredientName ? this.state.newIngredientName : 'None'}</p>
          <p class="col">New units: {this.state.newIngredientUnits ? this.state.newIngredientUnits : 'None'}</p>
        </div>
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
      token: '',
      redirect: '',
      ingredientKeyword: '',
      sourceKeyword: ''
    };

    if (this.props.location.state && this.props.location.state.token) {
      this.state.token = this.props.location.state.token;
    } else {
      this.state.redirect = '/login';
    }

    this.setIngredientKeyword = this.setIngredientKeyword.bind(this);
    this.setSourceKeyword = this.setSourceKeyword.bind(this);

    this.fetchListings();
  }

  fetchListings() {
    if (!this.fetchFn) {
      this.fetchFn = _.debounce(() => {
        axios({
          method: 'get',
          url: '/api/adminpricelistings',
          headers: {
            'Authorization': `Bearer ${this.state.token}`
          },
          params: {
            ingredient: this.state.ingredientKeyword,
            source: this.state.sourceKeyword
          }
        }).then(response => {
          this.setState({priceListings: response.data.results});
        }).catch(error => {
          if (error.status === 401) {
            this.setState({redirect: '/login'});
          } else if (error.status === 403) {
            this.setState({error: 'Not an admin'});
          } else {
            this.setState({error: error.data.error});
          }
        });
      }, 400);
    }

    this.fetchFn();
  }

  updateListing(listing) {
    axios({
      method: 'post',
      url: '/api/adminpricelistings/update',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      data: {
        ingredientName: listing.ingredientName,
        source: listing.source,
        timeCreated: listing.timeCreated,
        price: listing.price,
        units: listing.units
      }
    }).then(response => {
      this.fetchListings();

    }).catch(error => {
      if (error.status === 401) {
        this.setState({redirect: '/login'});
      } else if (error.status === 403) {
        this.setState({error: 'Not an admin'});
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

  updateListingLocally(listing, price, units) {
    console.log(listing);
    this.setState({priceListings: this.state.priceListings.map(l => {
      if (l.ingredientName === listing.ingredientName &&
        l.source === listing.source &&
        l.timeCreated === listing.timeCreated) {
        return {
          ingredientName: l.ingredientName,
          source: l.source,
          timeCreated: l.timeCreated,
          price: price,
          units: units
        };
      }

      return l;
    })});
  }

  setIngredientKeyword(e) {
    this.setState({ingredientKeyword: e.target.value}, this.fetchListings);
  }

  setSourceKeyword(e) {
    this.setState({sourceKeyword: e.target.value}, this.fetchListings);
  }

  render() {
    if (this.state.redirect) {
      console.log("redirecting");
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    // TODO: paginate
    const listings = this.state.priceListings.map(listing =>
      <tr key={`${listing.ingredientName}:${listing.source}:${listing.timeCreated}`}>
        <td>{listing.ingredientName}</td>
        <td>$<input type="number" min="0" step="0.01" value={listing.price} onChange={e => this.updateListingLocally(listing, e.target.value, listing.units)} /></td>
        <td><input type="text" value={listing.units} onChange={e => this.updateListingLocally(listing, listing.price, e.target.value)} /></td>
        <td>{listing.source}</td>
        <td>{listing.timeCreated}</td>
        <td><button class="btn btn-success" onClick={() => this.updateListing(listing)}>Update</button></td>
        <td><button class="btn btn-danger" onClick={() => this.deleteListing(listing)}>X</button></td>
      </tr>
    );

    return (
      <div>
      <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Price</th>
              <th>Units</th>
              <th>Source</th>
              <th>Time Created</th>
              <th><input type="text" class="form-control" placeholder="Filter ingredients" value={this.state.ingredientKeyword} onChange={this.setIngredientKeyword}/></th>
              <th><input type="text" class="form-control" placeholder="Filter sources" value={this.state.sourceKeyword} onChange={this.setSourceKeyword}/></th>
            </tr>
          </thead>
          <tbody>
          {listings}
          </tbody>
        </table>
        <p>{this.state.error}</p>
      </div>
    );
  }
}

ReactDOM.render(App(), document.getElementById("root"));
