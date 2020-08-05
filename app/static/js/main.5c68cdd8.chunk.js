(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{33:function(e,t,n){e.exports=n(34)},34:function(e,t,n){"use strict";n.r(t);var a=n(9),r=n(10),s=n(1),i=n(12),l=n(11),o=n(0),c=n.n(o),u=n(31),d=n.n(u),m=n(16),h=n(2),g=(n(39),n(4)),p=n.n(g),b=n(14),f=n.n(b);var v=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),(r=t.call(this,e)).toHome=r.toHome.bind(Object(s.a)(r)),r.toListings=r.toListings.bind(Object(s.a)(r)),r.toMealPlanner=r.toMealPlanner.bind(Object(s.a)(r)),r.toAdminListings=r.toAdminListings.bind(Object(s.a)(r)),r.logout=r.logout.bind(Object(s.a)(r)),r.state={redirect:""},r}return Object(r.a)(n,[{key:"toHome",value:function(e){e.preventDefault(),this.followLink("/")}},{key:"toListings",value:function(e){e.preventDefault(),this.followLink("/listings")}},{key:"toMealPlanner",value:function(e){e.preventDefault(),this.followLink("/newplan")}},{key:"toAdminListings",value:function(e){e.preventDefault(),this.followLink("/adminlistings")}},{key:"logout",value:function(e){e.preventDefault(),this.followLink("/login")}},{key:"followLink",value:function(e){console.log("redirecting to ".concat(e)),e!==this.props.here&&this.setState({redirect:e})}},{key:"render",value:function(){return this.state.redirect?c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.props.token}}}):c.a.createElement("div",null,c.a.createElement("div",{class:"pb-2 mt-4 mb-2 border-bottom"},c.a.createElement("h1",null,"The MeelReel")),c.a.createElement("nav",{class:"nav nav-tabs"},c.a.createElement("a",{class:"nav-link",href:"/",onClick:this.toHome},"Home"),c.a.createElement("a",{class:"nav-link",href:"/newplan",onClick:this.toMealPlanner},"New Meal Plan"),c.a.createElement("a",{class:"nav-link",href:"/listings",onClick:this.toListings},"Listings"),c.a.createElement("a",{class:"nav-link",href:"/adminlistings",onClick:this.toAdminListings},"Admin listings"),c.a.createElement("a",{class:"nav-link",href:"/login",onClick:this.logout},"Log out")))}}]),n}(c.a.Component),E=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),(r=t.call(this,e)).state={username:"",password:"",redirect:"",token:""},r.props.location.state&&r.props.location.state.token&&(r.state.token=r.props.location.state.token),r.handleUsernameChange=r.handleUsernameChange.bind(Object(s.a)(r)),r.handlePasswordChange=r.handlePasswordChange.bind(Object(s.a)(r)),r.handleSubmit=r.handleSubmit.bind(Object(s.a)(r)),r}return Object(r.a)(n,[{key:"handleUsernameChange",value:function(e){this.setState({username:e.target.value})}},{key:"handlePasswordChange",value:function(e){this.setState({password:e.target.value})}},{key:"handleSubmit",value:function(e){var t=this;e.preventDefault(),p()({method:"get",url:"/api/login",auth:{username:this.state.username,password:this.state.password}}).then((function(e){console.log("logged in!"),t.setState({redirect:"/",token:e.data.token})})).catch((function(e){console.log(e.data),t.setState({error:e.statusText})}))}},{key:"render",value:function(){if(this.state.redirect)return console.log("redirecting to ".concat(this.state.redirect)),c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}});var e=this.state.error?c.a.createElement("p",null,this.state.error):c.a.createElement("p",null);return c.a.createElement("div",null,c.a.createElement("p",null,"Don't have an account? ",c.a.createElement(m.b,{to:"/newaccount"},"Sign up")),e,c.a.createElement("form",{onSubmit:this.handleSubmit},c.a.createElement("div",{class:"form-row"},c.a.createElement("div",{class:"col-md-6"},c.a.createElement("label",{htmlFor:"username"},"Username"),c.a.createElement("input",{type:"text",id:"username",class:"form-control",value:this.state.username,onChange:this.handleUsernameChange})),c.a.createElement("div",{class:"col-md-6"},c.a.createElement("label",{htmlFor:"password"},"Password"),c.a.createElement("input",{type:"password",id:"password",class:"form-control",value:this.state.password,onChange:this.handlePasswordChange}))),c.a.createElement("button",{type:"submit",class:"btn btn-primary"},"Log in")))}}]),n}(c.a.Component),k=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),(r=t.call(this,e)).state={username:"",password1:"",password2:"",redirect:""},r.handleUsernameChange=r.handleUsernameChange.bind(Object(s.a)(r)),r.handlePassword1Change=r.handlePassword1Change.bind(Object(s.a)(r)),r.handlePassword2Change=r.handlePassword2Change.bind(Object(s.a)(r)),r.handleSubmit=r.handleSubmit.bind(Object(s.a)(r)),r}return Object(r.a)(n,[{key:"handleUsernameChange",value:function(e){this.setState({username:e.target.value})}},{key:"handlePassword1Change",value:function(e){this.setState({password1:e.target.value})}},{key:"handlePassword2Change",value:function(e){var t=e.target.value;this.setState((function(e,n){var a=e.password1!==t?"Passwords must match":"";return{password2:t,smallError:a}}))}},{key:"handleSubmit",value:function(e){var t=this;e.preventDefault(),this.state.username?this.state.password1===this.state.password2?this.state.password1?p()({method:"get",url:"/api/createaccount",auth:{username:this.state.username,password:this.state.password1}}).then((function(e){console.log("redirecting to /"),t.setState({redirect:"/",token:e.data.token})})).catch((function(e){t.setState({error:e.statusText})})):this.setState({smallError:"No password provided"}):this.setState({smallError:"Passwords must match"}):this.setState({smallError:"No username provided"})}},{key:"render",value:function(){if(this.state.redirect)return c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}});var e=this.state.error?c.a.createElement("p",null,this.state.error):c.a.createElement("p",null),t=this.state.smallError?c.a.createElement("p",null,this.state.smallError):c.a.createElement("p",null);return c.a.createElement("div",null,c.a.createElement("p",null,"Already have an account? ",c.a.createElement(m.b,{to:"/login"},"Log in")),e,c.a.createElement("form",{onSubmit:this.handleSubmit},c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"username"},"Username"),c.a.createElement("input",{type:"text",id:"username",class:"form-control",value:this.state.username,onChange:this.handleUsernameChange})),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"password1"},"Password"),c.a.createElement("input",{type:"password",id:"password1",class:"form-control",value:this.state.password1,onChange:this.handlePassword1Change})),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"password2"},"Retype Password"),c.a.createElement("input",{type:"password",id:"password2",class:"form-control",value:this.state.password2,onChange:this.handlePassword2Change})),c.a.createElement("button",{type:"submit",class:"btn btn-primary"},"Create account")),t)}}]),n}(c.a.Component);function y(e){return c.a.createElement("div",{class:"card"},c.a.createElement("img",{class:"card-img-top",src:e.imageURL,alt:e.name}),c.a.createElement("div",{class:"card-body"},c.a.createElement("h5",{class:"card-title"},e.name),c.a.createElement("div",{class:"container"},c.a.createElement("p",{class:"card-text row"},c.a.createElement("div",{class:"col"},"Calories: ",e.calories),c.a.createElement("div",{class:"col"},"Cost: $",e.cost))),c.a.createElement("a",{href:e.recipeURL,class:"btn btn-link"},"View Recipe")))}function w(e){return c.a.createElement("ul",{class:"list-group"},e.meals.map((function(e,t){return c.a.createElement("li",{key:t,class:"list-group-item"},c.a.createElement(y,{name:e.name,imageURL:e.imageURL,recipeURL:e.recipeURL,cost:e.cost,calories:e.calories}))})))}function S(e){return c.a.createElement("div",{class:"card"},c.a.createElement("div",{class:"card-body"},c.a.createElement("h5",{class:"card-title"},e.name),c.a.createElement("div",{class:"container"},c.a.createElement("p",{class:"card-text row"},c.a.createElement("div",null,"Created ",e.timeCreated),c.a.createElement("div",null,"Cost: $",e.totalCost),c.a.createElement("div",null,"Total Calories: ",e.totalCalories," (",e.totalCalories/e.recipes.length," calories per day)"))),c.a.createElement("hr",null),c.a.createElement("div",{class:"d-flex flex-wrap"},e.recipes.map((function(e,t){return c.a.createElement("div",{key:t},c.a.createElement(w,{meals:e}))})))))}var C=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),(r=t.call(this,e)).state={token:"",redirect:"",error:"",mealPlans:[]},r.props.location.state&&r.props.location.state.token?r.state.token=r.props.location.state.token:r.state.redirect="/login",r.fetchMealPlans(),r}return Object(r.a)(n,[{key:"fetchMealPlans",value:function(){var e=this;p()({method:"get",url:"/api/mealplan",headers:{Authorization:"Bearer ".concat(this.state.token)}}).then((function(t){e.setState({mealPlans:t.data.results})})).catch((function(t){e.setState({error:t.data.error})}))}},{key:"deleteMealPlan",value:function(e){var t=this;p()({method:"delete",url:"/api/mealplan",headers:{Authorization:"Bearer ".concat(this.state.token)},data:{id:e}}).then((function(e){t.fetchMealPlans()})).catch((function(e){t.setState({error:e.data.error})}))}},{key:"render",value:function(){var e=this;return this.state.redirect?c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}}):c.a.createElement("div",null,c.a.createElement(v,{token:this.state.token,here:this.props.location.pathname}),c.a.createElement("h3",null,"Your existing meal plans:"),c.a.createElement("ul",{class:"list-group list-group-flush"},this.state.mealPlans.map((function(t){return c.a.createElement("li",{key:t.id,class:"list-group-item"},c.a.createElement(S,{name:t.name,timeCreated:t.timeCreated,totalCost:t.totalCost,totalCalories:t.totalCalories,recipes:t.recipes}),c.a.createElement("br",null),c.a.createElement("a",{class:"btn btn-link",href:"/api/mealplan/{plan.id}.pdf",download:!0},"Download"),c.a.createElement("button",{class:"btn btn-danger",onClick:function(){return e.deleteMealPlan(t.id)}},"Delete"))}))))}}]),n}(c.a.Component),I=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),console.log("constructing plan meal page"),(r=t.call(this,e)).state={token:"",redirect:"",error:"",msg:"",budget:0,days:0,dailyCalories:0,title:"",minIngredients:[],maxIngredients:[],newIngredient:"",newAmount:0,newUnits:"",ingredientSearchResults:[],unitSearchResults:[],ingredientKeyword:"",unitKeyword:""},r.props.location.state&&r.props.location.state.token?r.state.token=r.props.location.state.token:r.state.redirect="/login",r.submitPlan=r.submitPlan.bind(Object(s.a)(r)),r.setTitle=r.setTitle.bind(Object(s.a)(r)),r.setBudget=r.setBudget.bind(Object(s.a)(r)),r.setCalories=r.setCalories.bind(Object(s.a)(r)),r.setDays=r.setDays.bind(Object(s.a)(r)),r.updateIngredientSearch=r.updateIngredientSearch.bind(Object(s.a)(r)),r.updateUnitSearch=r.updateUnitSearch.bind(Object(s.a)(r)),r.addMinIngredient=r.addMinIngredient.bind(Object(s.a)(r)),r.deleteMinIngredient=r.deleteMinIngredient.bind(Object(s.a)(r)),r.addMaxIngredient=r.addMaxIngredient.bind(Object(s.a)(r)),r.deleteMaxIngredient=r.deleteMaxIngredient.bind(Object(s.a)(r)),r.setIngredient=r.setIngredient.bind(Object(s.a)(r)),r.setUnits=r.setUnits.bind(Object(s.a)(r)),r.setAmount=r.setAmount.bind(Object(s.a)(r)),r}return Object(r.a)(n,[{key:"setTitle",value:function(e){this.setState({title:e.target.value})}},{key:"setBudget",value:function(e){this.setState({budget:e.target.value})}},{key:"setCalories",value:function(e){this.setState({calories:e.target.value})}},{key:"setDays",value:function(e){this.setState({days:e.target.value})}},{key:"setIngredient",value:function(e){this.setState({newIngredient:e,ingredientSearchResults:[]})}},{key:"setUnits",value:function(e){this.setState({newUnits:e,unitSearchResults:[]})}},{key:"setAmount",value:function(e){this.setState({newAmount:e.target.value})}},{key:"updateIngredientSearch",value:function(e){var t=this,n=e.target.value;this.setState({ingredientKeyword:n},(function(){t.ingFn||(t.ingFn=f.a.debounce((function(){p()({method:"get",url:"/api/search/ingredient",params:{kw:t.state.ingredientKeyword},headers:{Authorization:"Bearer ".concat(t.state.token)}}).then((function(e){t.setState({ingredientSearchResults:e.data.results})}))}),400))})),this.ingFn()}},{key:"updateUnitSearch",value:function(e){var t=this,n=e.target.value;this.setState({unitKeyword:n},(function(){t.unitFn||(t.unitFn=f.a.debounce((function(){p()({method:"get",url:"/api/search/unit",params:{kw:t.state.unitKeyword},headers:{Authorization:"Bearer ".concat(t.state.token)}}).then((function(e){t.setState({unitSearchResults:e.data.results})}))}),400))})),this.unitFn()}},{key:"addMinIngredient",value:function(){var e=this;this.state.minIngredients.some((function(t){return t.name===e.state.newIngredient}))||this.setState((function(e,t){return e.minIngredients.push({name:e.newIngredient,amount:e.newAmount,units:e.newUnits}),{minIngredients:e.minIngredients}}))}},{key:"deleteMinIngredient",value:function(e){console.log("deleting ".concat(e," from min")),console.log(this.state.minIngredients),this.setState((function(t,n){return{minIngredients:t.minIngredients.filter((function(t){return t.name!==e}))}}))}},{key:"addMaxIngredient",value:function(){var e=this;this.state.minIngredients.some((function(t){return t.name===e.state.newIngredient}))||this.setState((function(e,t){return e.maxIngredients.push({name:e.newIngredient,amount:e.newAmount,units:e.newUnits}),{maxIngredients:e.maxIngredients}}))}},{key:"deleteMaxIngredient",value:function(e){console.log("deleting ".concat(e," from max")),console.log(this.state.maxIngredients),this.setState((function(t,n){return{maxIngredients:t.maxIngredients.filter((function(t){return t.name!==e}))}}))}},{key:"submitPlan",value:function(e){var t=this;e.preventDefault();var n={budget:this.state.budget,dailyCalories:this.state.dailyCalories,days:this.state.days,title:this.state.title,minIngredients:this.state.minIngredients,maxIngredients:this.state.maxIngredients};p()({method:"post",url:"/api/mealplan",headers:{Authorization:"Basic ".concat(this.state.token)},data:n}).then((function(e){t.setState({redirect:"/"})})).catch((function(e){t.setState({error:e.data.error})}))}},{key:"render",value:function(){var e=this;if(console.log("rendering plan meal page"),this.state.redirect)return console.log("redirecting"),c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}});var t=this.state.minIngredients.map((function(t){return c.a.createElement("li",{key:t.name,class:"list-group-item"},c.a.createElement("div",{key:t.name,class:"card"},c.a.createElement("div",{class:"card-body"},c.a.createElement("p",null,t.name,": ",t.amount," ",t.units),c.a.createElement("button",{class:"btn btn-danger",onClick:function(){return e.deleteMinIngredient(t.name)}},"X"))))})),n=this.state.maxIngredients.map((function(t){return c.a.createElement("li",{key:t.name,class:"list-group-item"},c.a.createElement("div",{class:"card"},c.a.createElement("div",{class:"card-body"},c.a.createElement("p",{class:"card-text"},t.name,": ",t.amount," ",t.units),c.a.createElement("button",{class:"btn btn-danger",onClick:function(){return e.deleteMaxIngredient(t.name)}},"X"))))}));return c.a.createElement("div",null,c.a.createElement(v,{token:this.state.token,here:this.props.location.pathname}),c.a.createElement("h3",null,"Generate a new meal plan"),c.a.createElement("div",null,c.a.createElement("div",{class:"row"},c.a.createElement("div",{class:"form-group col-md-6"},c.a.createElement("label",{htmlFor:"title"},"Title (optional)"),c.a.createElement("input",{id:"title",type:"text",class:"form-control",value:this.state.title,onChange:this.setTitle})),c.a.createElement("div",{class:"form-group col-md-6"},c.a.createElement("label",{htmlFor:"budget"},"Budget"),"$",c.a.createElement("input",{id:"budget",type:"number",min:"0",step:"0.01",class:"form-control",value:this.state.budget,onChange:this.setBudget})),c.a.createElement("div",{class:"form-group col-md-6"},c.a.createElement("label",{htmlFor:"calories"},"Daily Calories"),c.a.createElement("input",{id:"calories",type:"number",min:"0",class:"form-control",value:this.state.calories,onChange:this.setCalories})),c.a.createElement("div",{class:"form-group col-md-6"},c.a.createElement("label",{htmlFor:"days"},"Days"),c.a.createElement("input",{id:"days",type:"number",min:"1",max:"31",class:"form-control",value:this.state.days,onChange:this.setDays}))),c.a.createElement("hr",null),c.a.createElement("div",{class:"row"},c.a.createElement("div",{class:"col-6"},c.a.createElement("h4",null,"Minimum Ingredients"),c.a.createElement("ul",{class:"list-group"},t)),c.a.createElement("div",{class:"col-6"},c.a.createElement("h4",null,"Maximum Ingredients"),c.a.createElement("ul",{class:"list-group"},n))),c.a.createElement("hr",null),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"search-ingr"},"Ingredient"),c.a.createElement("input",{id:"search-ingr",class:"form-control",type:"text",value:this.ingredientKeyword,onChange:this.updateIngredientSearch})),c.a.createElement("ul",{class:"list-group list-group-horizontal"},this.state.ingredientSearchResults.map((function(t){return c.a.createElement("li",{key:t,class:"list-group-item"},c.a.createElement("button",{class:"btn btn-secondary",onClick:function(){return e.setIngredient(t)}},t))}))),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"search-unit"},"Unit"),c.a.createElement("input",{id:"search-unit",class:"list-group-item",type:"text",value:this.unitKeyword,onChange:this.updateUnitSearch})),c.a.createElement("ul",{class:"list-group list-group-horizontal"},this.state.unitSearchResults.map((function(t){return c.a.createElement("li",{key:t,class:"list-group-item"},c.a.createElement("button",{class:"btn btn-secondary",onClick:function(){return e.setUnits(t)}},t))}))),c.a.createElement("hr",null),c.a.createElement("div",{class:"form-row"},c.a.createElement("div",{class:"col-3"},this.state.newIngredient,": "),c.a.createElement("input",{id:"amount",class:"form-control col-8",type:"number",min:"0",step:"0.01",value:this.state.newAmount,onChange:this.setAmount}),c.a.createElement("div",{class:"col-1"},this.state.newUnits)),c.a.createElement("div",{class:"form-group"},c.a.createElement("button",{class:"btn btn-dark",onClick:this.addMinIngredient},"Add as minimum"),c.a.createElement("button",{class:"btn btn-light",onClick:this.addMaxIngredient},"Add as maximum")),c.a.createElement("button",{class:"btn btn-primary",onClick:this.submitPlan},"Create Plan")))}}]),n}(c.a.Component),O=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),console.log("constructing price listings"),(r=t.call(this,e)).state={ingredientSuggestions:[],unitSuggestions:[],token:"",ingredientSearchTerm:"",unitSearchTerm:"",newIngredientName:"",newIngredientSource:"",newIngredientPrice:0,newIngredientUnits:"",redirect:"",msg:""},r.props.location.state&&r.props.location.state.token?r.state.token=r.props.location.state.token:r.state.redirect="/login",r.searchIngredient=r.searchIngredient.bind(Object(s.a)(r)),r.searchUnit=r.searchUnit.bind(Object(s.a)(r)),r.fetchNeededPriceListing=r.fetchNeededPriceListing.bind(Object(s.a)(r)),r.setPrice=r.setPrice.bind(Object(s.a)(r)),r.setAmount=r.setAmount.bind(Object(s.a)(r)),r.selectUnits=r.selectUnits.bind(Object(s.a)(r)),r.selectIngredient=r.selectIngredient.bind(Object(s.a)(r)),r.selectSource=r.selectSource.bind(Object(s.a)(r)),r.addPriceListing=r.addPriceListing.bind(Object(s.a)(r)),r}return Object(r.a)(n,[{key:"searchIngredient",value:function(e){var t=this,n=e.target.value;this.setState({ingredientSearchTerm:n},(function(){t.searchIngredientFn||(t.searchIngredientFn=f.a.debounce((function(){t.state.ingredientSearchTerm?p()({method:"get",url:"/api/search/ingredient",headers:{Authorization:"Bearer ".concat(t.state.token)},params:{kw:t.state.ingredientSearchTerm}}).then((function(e){console.log(e.data),t.setState({ingredientSuggestions:e.data.results})})).catch((function(e){401===e.status?t.setState({redirect:"/login"}):t.setState({error:e.data.error})})):t.setState({ingredientSuggestions:[]})}),400)),t.searchIngredientFn()}))}},{key:"searchUnit",value:function(e){var t=this,n=e.target.value;this.setState({unitSearchTerm:n},(function(){t.searchUnitFn||(t.searchUnitFn=f.a.debounce((function(){t.state.unitSearchTerm?p()({method:"get",url:"/api/search/unit",headers:{Authorization:"Bearer ".concat(t.state.token)},params:{kw:t.state.unitSearchTerm}}).then((function(e){console.log(e.data),t.setState({unitSuggestions:e.data.results})})).catch((function(e){401===e.status?t.setState({redirect:"/login"}):t.setState({error:e.data.error})})):t.setState({unitSuggestions:[]})}),400)),t.searchUnitFn()}))}},{key:"fetchNeededPriceListing",value:function(){var e=this;p()({method:"get",url:"/api/pricelistings",headers:{Authorization:"Bearer ".concat(this.state.token)}}).then((function(t){console.log(t.data),e.setState({newIngredientName:t.data.result,ingredientSuggestions:[]})})).catch((function(t){401===t.status?e.setState({redirect:"/login"}):e.setState({error:t.data.error})}))}},{key:"selectIngredient",value:function(e){this.setState({newIngredientName:e,ingredientSuggestions:[]})}},{key:"selectUnits",value:function(e){this.setState({newIngredientUnits:e,unitSuggestions:[]})}},{key:"selectSource",value:function(e){this.setState({newIngredientSource:e.target.value})}},{key:"setPrice",value:function(e){this.setState({newIngredientPrice:e.target.value})}},{key:"setAmount",value:function(e){this.setState({newIngredientAmount:e.target.value})}},{key:"addPriceListing",value:function(e){var t=this;e&&e.preventDefault();var n={ingredientName:this.state.newIngredientName,price:this.state.newIngredientPrice,amount:this.state.newIngredientAmount,source:this.state.newIngredientSource,units:this.state.newIngredientUnits};["ingredientName","source","units"].forEach((function(e){n[e]||t.setState({error:"Missing field: ".concat(e)})})),n.price<0?this.setState({error:"Price cannot be negative"}):n.amount&&n.amount<0?this.setState({error:"Amount cannot be negative"}):p()({method:"post",url:"/api/pricelistings",headers:{Authorization:"Bearer ".concat(this.state.token)},data:n}).then((function(e){t.setState({error:"",msg:"Price for ".concat(n.ingredientName," successfully added!")})})).catch((function(e){401===e.status?t.setState({redirect:"/login"}):t.setState({error:e.data.error})}))}},{key:"render",value:function(){var e,t,n,a=this;return this.state.redirect?c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}}):(this.state.ingredientSuggestions?e=c.a.createElement("ul",{class:"list-group list-group-horizontal"},this.state.ingredientSuggestions.map((function(e){return c.a.createElement("li",{key:e,class:"list-group-item"},c.a.createElement("button",{class:"btn btn-secondary",onClick:function(){return a.selectIngredient(e)}},e))}))):this.ingredientOptions="",t=this.state.unitSuggestions?c.a.createElement("ul",{class:"list-group list-group-horizontal"},this.state.unitSuggestions.map((function(e){return c.a.createElement("li",{key:e,class:"list-group-item"},c.a.createElement("button",{class:"btn btn-secondary",onClick:function(){return a.selectUnits(e)}},e))}))):"",n=this.state.newIngredientName&&this.state.newIngredientUnits?c.a.createElement("div",null,c.a.createElement("form",{onSubmit:this.addPriceListing},c.a.createElement("h5",null,this.state.newIngredientName),c.a.createElement("div",null,c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"source"},"Source"),c.a.createElement("input",{type:"text",class:"form-control",id:"source",value:this.state.newIngredientSource,onChange:this.selectSource})),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"price"},"Price ($): "),c.a.createElement("input",{type:"number",class:"form-control",id:"price",min:"0",step:"0.01",value:this.state.newIngredientPrice,onChange:this.setPrice})),c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"amount"},"Amount (",this.state.newIngredientUnits,")"),c.a.createElement("input",{type:"number",class:"form-control",id:"amount",min:"0",step:"0.01",value:this.state.newIngredientAmount,onChange:this.setAmount}))),c.a.createElement("button",{type:"submit",class:"btn btn-primary"},"Submit"))):"",c.a.createElement("div",null,c.a.createElement(v,{token:this.state.token,here:this.props.location.pathname}),c.a.createElement("div",null,c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"searchIngredient"},"Search for an ingredient to add a price listing for:"),c.a.createElement("input",{id:"searchIngredient",class:"form-control",value:this.ingredientSearchTerm,onChange:this.searchIngredient}),c.a.createElement("button",{class:"btn btn-info",onClick:this.fetchNeededPriceListing},"Choose for me")),e,c.a.createElement("div",{class:"form-group"},c.a.createElement("label",{htmlFor:"searchUnit"},"Select Units"),c.a.createElement("input",{id:"searchUnit",class:"form-control",value:this.unitSearchTerm,onChange:this.searchUnit})),t),c.a.createElement("br",null),c.a.createElement("div",{class:"row"},c.a.createElement("p",{class:"col"},"New ingredient: ",this.state.newIngredientName?this.state.newIngredientName:"None"),c.a.createElement("p",{class:"col"},"New units: ",this.state.newIngredientUnits?this.state.newIngredientUnits:"None")),c.a.createElement("hr",null),n,this.state.error,this.state.msg))}}]),n}(c.a.Component),j=function(e){Object(i.a)(n,e);var t=Object(l.a)(n);function n(e){var r;return Object(a.a)(this,n),(r=t.call(this,e)).state={priceListings:[],token:"",redirect:"",ingredientKeyword:"",sourceKeyword:""},r.props.location.state&&r.props.location.state.token?r.state.token=r.props.location.state.token:r.state.redirect="/login",r.setIngredientKeyword=r.setIngredientKeyword.bind(Object(s.a)(r)),r.setSourceKeyword=r.setSourceKeyword.bind(Object(s.a)(r)),r.fetchListings(),r}return Object(r.a)(n,[{key:"fetchListings",value:function(){var e=this;this.fetchFn||(this.fetchFn=f.a.debounce((function(){p()({method:"get",url:"/api/adminpricelistings",headers:{Authorization:"Bearer ".concat(e.state.token)},params:{ingredient:e.state.ingredientKeyword,source:e.state.sourceKeyword}}).then((function(t){e.setState({priceListings:t.data.results})})).catch((function(t){401===t.status?e.setState({redirect:"/login"}):403===t.status?e.setState({error:"Not an admin"}):e.setState({error:t.data.error})}))}),400)),this.fetchFn()}},{key:"updateListing",value:function(e){var t=this;p()({method:"post",url:"/api/adminpricelistings/update",headers:{Authorization:"Bearer ".concat(this.state.token)},data:{ingredientName:e.ingredientName,source:e.source,timeCreated:e.timeCreated,price:e.price,units:e.units}}).then((function(e){t.fetchListings()})).catch((function(e){401===e.status?t.setState({redirect:"/login"}):403===e.status?t.setState({error:"Not an admin"}):t.setState({error:e.data.error})}))}},{key:"deleteListing",value:function(e){var t=this;p()({method:"post",url:"/api/adminpricelistings/delete",headers:{Authorization:"Bearer ".concat(this.state.token)},data:{ingredientName:e.ingredientName,source:e.source,timeCreated:e.timeCreated}}).then((function(e){t.fetchListings()})).catch((function(e){401===e.status?t.setState({redirect:"/login"}):403===e.status||t.setState({error:e.data.error})}))}},{key:"updateListingLocally",value:function(e,t,n){console.log(e),this.setState({priceListings:this.state.priceListings.map((function(a){return a.ingredientName===e.ingredientName&&a.source===e.source&&a.timeCreated===e.timeCreated?{ingredientName:a.ingredientName,source:a.source,timeCreated:a.timeCreated,price:t,units:n}:a}))})}},{key:"setIngredientKeyword",value:function(e){this.setState({ingredientKeyword:e.target.value},this.fetchListings)}},{key:"setSourceKeyword",value:function(e){this.setState({sourceKeyword:e.target.value},this.fetchListings)}},{key:"render",value:function(){var e=this;if(this.state.redirect)return console.log("redirecting"),c.a.createElement(h.a,{to:{pathname:this.state.redirect,state:{token:this.state.token}}});var t=this.state.priceListings.map((function(t){return c.a.createElement("tr",{key:"".concat(t.ingredientName,":").concat(t.source,":").concat(t.timeCreated)},c.a.createElement("td",null,t.ingredientName),c.a.createElement("td",null,"$",c.a.createElement("input",{type:"number",min:"0",step:"0.01",value:t.price,onChange:function(n){return e.updateListingLocally(t,n.target.value,t.units)}})),c.a.createElement("td",null,c.a.createElement("input",{type:"text",value:t.units,onChange:function(n){return e.updateListingLocally(t,t.price,n.target.value)}})),c.a.createElement("td",null,t.source),c.a.createElement("td",null,t.timeCreated),c.a.createElement("td",null,c.a.createElement("button",{class:"btn btn-success",onClick:function(){return e.updateListing(t)}},"Update")),c.a.createElement("td",null,c.a.createElement("button",{class:"btn btn-danger",onClick:function(){return e.deleteListing(t)}},"X")))}));return c.a.createElement("div",null,c.a.createElement(v,{token:this.state.token,here:this.props.location.pathname}),c.a.createElement("table",{class:"table table-striped table-hover"},c.a.createElement("thead",null,c.a.createElement("tr",null,c.a.createElement("th",null,"Ingredient Name"),c.a.createElement("th",null,"Price"),c.a.createElement("th",null,"Units"),c.a.createElement("th",null,"Source"),c.a.createElement("th",null,"Time Created"),c.a.createElement("th",null,c.a.createElement("input",{type:"text",class:"form-control",placeholder:"Filter ingredients",value:this.state.ingredientKeyword,onChange:this.setIngredientKeyword})),c.a.createElement("th",null,c.a.createElement("input",{type:"text",class:"form-control",placeholder:"Filter sources",value:this.state.sourceKeyword,onChange:this.setSourceKeyword})))),c.a.createElement("tbody",null,t)),c.a.createElement("p",null,this.state.error))}}]),n}(c.a.Component);d.a.render(c.a.createElement(m.a,null,c.a.createElement("div",null,c.a.createElement(h.d,null,c.a.createElement(h.b,{exact:!0,path:"/login",component:E}),c.a.createElement(h.b,{exact:!0,path:"/newaccount",component:k}),c.a.createElement(h.b,{exact:!0,path:"/newplan",component:I}),c.a.createElement(h.b,{exact:!0,path:"/",component:C}),c.a.createElement(h.b,{exact:!0,path:"/listings",component:O}),c.a.createElement(h.b,{exact:!0,path:"/adminlistings",component:j})))),document.getElementById("root"))},39:function(e,t,n){}},[[33,1,2]]]);
//# sourceMappingURL=main.5c68cdd8.chunk.js.map