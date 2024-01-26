import './App.css';
import NavBar from '../src/components/NavBar';
import Footer from '../src/components/Footer';
import SignIn from '../src//components/SignIn'

function App() {
  return (
    <div className="App">
      <NavBar></NavBar>
      <div className="intro">
        <div id="left">
          <h1 id="logo">MoCode</h1>
          <h2 id="liner">Get Your Offer Letter!</h2>
        </div>
        <div id="right">
          <img alt="Description"></img>
        </div>
      </div>
      <SignIn></SignIn>
      <Footer></Footer>
    </div>
  );
}

export default App;
