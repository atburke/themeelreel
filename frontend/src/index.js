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

    this.toListings = this.toListings.bind(this);
    this.toMealPlanner = this.toMealPlanner.bind(this);
    this.toAdminListings = this.toAdminListings.bind(this);

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
      <nav class="nav nav-pills">
        <a class="nav-link {this.props.here === '/' ? active : ''}" href="/" onClick={this.toHome}>Home</a>
        <a class="nav-link {this.props.here === '/newplan' ? active : ''}" href="/newplan" onClick={this.toMealPlanner}>New Meal Plan</a>
        <a class="nav-link {this.props.here === '/listings' ? active : ''}" href="/listings" onClick={this.toListings}>Listings</a>
        <a class="nav-link {this.props.here === '/adminlistings' ? active : ''}" href="/adminlistings" onClick={this.toAdminListings}>Admin listings</a>
      </nav>
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

function Meal(props) {
  return (
    <div>
      <div>
        <div><a href={props.recipeURL}>{props.name}</a></div>
        <div>{props.calories} calories</div>
        <div>${props.cost}</div>
      </div>
      <div><img src={props.imageURL} alt={props.name}/></div>
    </div>
  );
}

function DayPlan(props) {
  return (
    <ul>
      {props.meals.map((meal, index) => (
        <li key={index}><Meal name={meal.name} imageURL={meal.imageURL} recipeURL={meal.recipeURL} cost={meal.cost} calories={meal.calories}/></li>
      ))}
    </ul>
  );
}

function MealPlan(props) {
  return (
    <div>
      <div>
        <div>{props.name}</div>
        <div>{props.timeCreated}</div>
        <div>Cost: ${props.totalCost}</div>
        <div>Total Calories: {props.totalCalories} ({props.totalCalories / props.recipes.length} calories per day)</div>
      </div>
      <div>
        {props.recipes.map((dayPlan, index) => (
          <div key={index}>
            <DayPlan meals={dayPlan}/>
          </div>
        ))}
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
      {this.state.mealPlans.map(plan => (
        <div key={plan.id}>
          <MealPlan name={plan.name} timeCreated={plan.timeCreated} totalCost={plan.totalCost} totalCalories={plan.totalCalories} recipes={plan.recipes}/>
          <a class="btn btn-link" href="/api/mealplan/{plan.id}.pdf" download>Download</a>
          <button class="btn btn-danger" onClick={() => this.deleteMealPlan(plan.id)}>Delete</button>
        </div>
      ))}
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
      return <Redirect to={{
        pathname: this.state.redirect,
        state: { token: this.state.token }
      }} />;
    }

    let mins = this.state.minIngredients.map(ing => (
      <div key={ing.name}>
        <span>{ing.name}: {ing.amount} {ing.units}</span>
        <button class="btn btn-danger" onClick={() => this.deleteMinIngredient(ing.name)}>X</button>
      </div>
    ));

    let maxs = this.state.maxIngredients.map(ing => (
      <div key={ing.name}>
        <span>{ing.name}: {ing.amount} {ing.units}</span>
        <button class="btn btn-danger" onClick={() => this.deleteMaxIngredient(ing.name)}>X</button>
      </div>
    ));

    return (
      <div>
        <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <div>
          <label htmlFor="title">Title (optional)</label>
          <input id="title" type="text" value={this.state.title} onChange={this.setTitle} />
          <label htmlFor="budget">Budget</label>
          $<input id="budget" type="number" min="0" step="0.01" value={this.state.budget} onChange={this.setBudget} />
          <label htmlFor="calories">Daily Calories</label>
          <input id="calories" type="number" min="0" value={this.state.calories} onChange={this.setCalories} />
          <label htmlFor="days">Days</label>
          <input id="days" type="number" min="1" max="31" value={this.state.days} onChange={this.setDays} />
          <hr />
          <p>Minimum Ingredients</p>
          {mins}
          <p>Maximum Ingredients</p>
          {maxs}
          <hr />
          <label htmlFor="search-ingr">Ingredient</label>
          <input id="search-ingr" type="text" onChange={this.updateIngredientSearch} />
          <ul>
            {this.state.ingredientSearchResults.map(name => (
              <li key={name}><button class="btn btn-secondary" onClick={() => this.setIngredient(name)}>{name}</button></li>
            ))}
          </ul>
          <label htmlFor="search-unit">Unit</label>
          <input id="search-unit" type="text" onChange={this.updateUnitSearch} />
          <ul>
            {this.state.unitSearchResults.map(name => (
              <li key={name}><button class="btn btn-secondary" onClick={() => this.setUnits(name)}>{name}</button></li>
            ))}
          </ul>
          <hr />
          <p>{this.state.newIngredient}</p>
          <label htmlFor="amount">Amount:</label>
          <input id="amount" type="number" min="0" step="0.01" value={this.state.newAmount} onChange={this.setAmount} />
          <p>{this.state.newUnits}</p>
          <button class="btn btn-light" onClick={this.addMinIngredient}>Add as minimum</button>
          <button class="btn btn-dark" onClick={this.addMaxIngredient}>Add as maximum</button>
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
      console.log(response.data);
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
      console.log(response.data);
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
    console.log("rendering price listing page");
    if (this.state.redirect) {
      console.log("redirecting");
      return <Redirect to={{
        pathname: this.state.redirect,
        state: {token: this.state.token}
      }} />;
    }

    let ingredientOptions;
    if (this.state.ingredientSuggestions) {
      ingredientOptions = (
        <ul>
          {this.state.ingredientSuggestions.map(name => (
            <li><button class="btn btn-secondary" onClick={() => this.selectIngredient(name)}>{name}</button></li>
          ))}
        </ul>
      );
    } else {
      this.ingredientOptions = <div></div>;
    }

    let unitOptions;
    if (this.state.unitSuggestions) {
      unitOptions = (
        <ul>
        {this.state.unitSuggestions.map(unit => (
          <li><button class="btn btn-secondary" onClick={() => this.selectUnits(unit)}>{unit}</button></li>
        ))}
        </ul>
      );
    } else {
      unitOptions = <div></div>;
    }

    let form;
    console.log(this.state);
    if (this.state.newIngredientName && this.state.newIngredientUnits) {
      form = (
          <div>
          <form onSubmit={this.addPriceListing}>
            <p>{this.state.newIngredientName}</p>
            <label htmlFor="source">Source</label>
            <input type="text" id="source" value={this.state.newIngredientSource} onChange={this.selectSource} />
            <label htmlFor="price">Price</label>
            $<input type="number" id="price" min="0" step="0.01" value={this.state.newIngredientPrice} onChange={this.setPrice}/>
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" min="0" step="0.01" value={this.state.newIngredientAmount} onChange={this.setAmount}/>
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
      <AppHeader token={this.state.token} here={this.props.location.pathname} />
        <label htmlFor="searchIngredient">Search for an ingredient to add a price listing for:</label>
        <input id="searchIngredient" value={this.ingredientSearchTerm} onChange={this.searchIngredient}/>
        {ingredientOptions}
        <button class="btn btn-info" onClick={this.fetchNeededPriceListing}>Choose for me</button>
        <label htmlFor="searchUnit">Select Units</label>
        <input id="searchUnit" value={this.unitSearchTerm} onChange={this.searchUnit} />
        {unitOptions}
        <br />
        {this.state.newIngredientName ? <p>{this.state.newIngredientName}</p> : ''}
        {this.state.newIngredientUnits ? <p>{this.state.newIngredientUnits}</p> : ''}
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
    this.setState({ingredientKeyword: e.target.value});
  }

  setSourceKeyword(e) {
    this.setState({sourceKeyword: e.target.value});
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
        <table>
          <tr>
            <th>Ingredient Name</th>
            <th>Price</th>
            <th>Units</th>
            <th>Source</th>
            <th>Time Created</th>
            <th><input type="text" class="form-control" placeholder="Filter ingredients" value={this.state.ingredientKeyword} onChange={this.setIngredientKeyword}/></th>
            <th><input type="text" class="form-control" placeholder="Filter sources" value={this.state.sourceKeyword} onChange={this.setSourceKeyword}/></th>
          </tr>
          {listings}
        </table>
        <p>{this.state.error}</p>
      </div>
    );
  }
}

ReactDOM.render(App(), document.getElementById("root"));
