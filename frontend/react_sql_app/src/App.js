
import ApiOpenAI from './ApiOpenAI';
import ApiBc49 from './ApiBc49';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

let url = 'http://localhost:5000/api/openai';
let url2 = 'http://localhost:5000/api/data';

const App = () => {

  
  return (
    <div>
      <ApiOpenAI endpoint={url} />
      <ApiBc49 endpoint={url2} />
    </div>
  );
};

export default App;
