import React from 'react';
import superagent from 'superagent';

// stuff to get the fields. Goes inside?
let __API_URL__ = 'https://city-explorer-backend.herokuapp.com';
let GOOGLE_MAPS_API_KEY = /* use .env to insert my key **/ 'key';
const fields = ['weather', 'yelp', 'meetups', 'movies', 'trails'];


const getLocation = (searchQuery) => {
  let url = `${__API_URL__}/location?${searchQuery}`;
  let results =  superagent(url).query({ data: searchQuery });
  return results.body;
};

const mapURL = (location) => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude}%2c%20${location.longitude}&zoom=13&size=600x300&maptype=roadmap
  &key=${GOOGLE_MAPS_API_KEY}`;
};

//put inside
let data = results.reduce((acc, result, idx) => {
  acc[resources[idx]] = result.body;
  return acc;
}, {});

const getFields = (location) => {
  let urls = fields.map(field => `${__API_URL__}/${resource}`);
  let dataRequests = urls.map(url => {
    return superagent.get(url).query({ data: location });
  });

  let results = Promise.all(dataRequests);
  let data = results.reduce((acc, result, idx) => {
    acc[resources[idx]] = result.body;
    return acc;
  }, {});
  return data;
};

//Where everything is compiled
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      starter: true,
      query: null,
      errMsg: null,
      map_url: 'https://via.placeholder.com/600x300',
      data: {}
    };
  }


  handleErr = (errMsg) => this.setState({ errMsg });


  resetErr = () => this.setState({errorMessage: null});


  handleSubmit = (query) => {
    this.resetErr();
    try{
      let location = await getLocation(query);
      
      this.setState({
        starter: false,
        query: location.formatted_query,
        map_url: mapURL(location),
      });

      let data = await getFields(query);
      this.setState({data});
      
    } catch (err) {
      this.handeErr(err.message);
    }
  };

  render(){
    return (
      <>
        <Header />
          <main>
          <URLForm />
          <Search getStuff={this.handleSubmit} />
          <Map hide={this.state.initialView} url={this.state.map_url} />
          <Error> {this.state.errMsg}</Error>
          <Query hide={this.state.starter} query={this.state.query} />
          <Columns hide={this.state.initialView} data={this.state.data} />
          </main>
      </>
    );
  }

}



//components

//header, always there
class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <header>
        <h1>City Explorer</h1>
        <p>Enter a location below to learn about the weather, events, restaurants, movies filmed there, and more!</p>
      </header>
    );
  }
}


//url form, only there when first rendered. taken away later. needs a hidemeclass to be taken away later
class URLForm extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (

      <form id="url-form" className="hideme">
        <label>Enter the URL to your deployed back end, making sure to remove the trailing forward slash</label>
        <input type="text" id="back-end-url" />
      </form>
    );
  }
}

//search portion
class Search extends React.Component{
  constructor(props) {
    super(props);
  }

  newGet = (err) => {
    err.preventDefault();
    props.getStuff(err.target[0].value);
  };

  render() {
    return(
      <form id="search form" onSubmit={newGet}>
        <label id="searchLabel" className="search"> Search For a location></label>
        <input type="text" name="search" id="inputSearch" placeholder="Enter a location here"></input>
        <button type="submit"> Explore! </button>
      </form>
    )
  }
}

//map component
class Map extends React.Component{
  constructor(props) {
    super(props);
  }
  render(){
    return(
      <img id="map" className={this.props.hide ? 'hide' : null} src={this.props.url}></img>
    )
  }

}

// error info

class Error extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return(
      <section className='error=container'> {this.props.children}</section>
    )
  }
}  

//query info

class Query extends React.Component {
  constructor(props) {
    super(props);
  }
  classes = this.props.hide ? 'query-placeholder hide' : 'query-placeholder';

  render(){
    return(
      <h2 className={classes}> Here are the results for {this.props.query}</h2>    
    )
  }
}  

//columns container
class Columns extends React.Component {
  constructor(props) {
    super(props);
  }
  classes = this.props.hide ? 'query-placeholder hide' : 'query-placeholder';

  render(){
    return(
      <div className={classes}>
        <section>
        <h3>Results from the Dark Sky API</h3>
        <ul className="weather-results">
          {
            props.weatherdata.map((day, idx) => <li key={idx}>
              The forecast for {day.time} is: {day.forecast}
            </li>)
          }
        </ul>
        </section>


        <section>
        <h3>Results from the Yelp API</h3>
          <ul className="yelp-results">
            {props.yelpdata.map((restaurant, idx) => {
              return (
                <li key={idx}>
                  <a href={restaurant.url}>{restaurant.name}</a>
                  <p>The average rating is {restaurant.rating} out of 5 and the average cost is {restaurant.price} out of 4</p>
                  <img src={restaurant.image_url} alt={restaurant.name} />
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3>Results from the Meetup API</h3>
          <ul className="meetups-results">
            {props.meetupsdata.map((meetup, idx) => {
              return (
                <li key={idx}>
                  <a href={meetup.link}>{meetup.name}</a>
                  <p>Hosted by: {meetup.host}</p>
                  <p>Created on: {meetup.creation_date}</p>
                </li>
              );
            })}
          </ul>        
        </section>


        <section>
      <h3>Results from The Movie DB API</h3>
        <ul className="movies-results">
          {props.moviesdata.map((movie, idx) => {
            return (
              <li key={idx}>
                <p><span>{movie.title}</span> was relased on {movie.released_on}. Out of {movie.total_votes} total votes, {movie.title} has an average vote of {movie.average_votes} and a popularity score of {movie.popularity}.</p>
                <img src={movie.image_url} alt={movie.title} />
                <p>{movie.overview}</p>
              </li>
            );
          })}
        </ul>
        </section>

        <section>
          <h3>Results from the Hiking Project API</h3>
          <ul className="trails-results">
            {props.trailsdata.map((trail, idx) => {
              return (
                <li key={idx}>
                  <p>Hike Name: <a href={trail.trail_url}>{trail.name}</a>, Location: {trail.location}, Distance: {trail.length} miles</p>
                  <p>On {trail.condition_date} at {trail.condition_time}, trail conditions were reported as: {trail.conditions}</p>
                  <p>This trail has a rating of {trail.stars} stars (out of {trail.star_votes} votes)</p>
                  <p>{trail.summary}</p>
                </li>
              );
            })}
          </ul>
        </section>

      </div>
    )
  }
}  


// container for the 






export default App;
