/*import logo from './logo.svg';*/
import './App.css';
import Input from './Input.js';
import Map from './map';
import { useLoadScript } from "@react-google-maps/api";


function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBrho3RkNlDaztsqX0paNbBW4Do98758a4" // Add your API key
  });

  return (
    <div className="App">
      <header className="App-header">
        <Input />
      </header>
      {isLoaded ? <Map /> : null}
    </div>
  );
}
export default App;
