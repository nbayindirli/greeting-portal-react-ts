import './App.css';

function App() {

  const greet = () => {

  };

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="waving hand emoji">👋</span> Hey there!
        </div>

        <div className="bio">
        Hi, I'm Noah. Connect your Ethereum wallet and greet me!
        </div>

        <button className="greetButton" onClick={greet}>
          Greet Me
        </button>
      </div>
    </div>
  );
}

export default App;
