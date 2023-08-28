/*import logo from './logo.svg';*/
import './App.css';
import Input from './Input.js';
import GoogleApiWrapper from './map';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Input />       
      </header>      
      <GoogleApiWrapper />
    </div>
    
  );
}

export default App;
