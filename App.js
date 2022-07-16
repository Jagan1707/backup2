import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import DataInd from './component/Com-1/ind'
import Hookcomp from './component/Com-2/sample'
import Register from './component/Com-3/Register';
import Signup from "./component/Parent/sign-up"
import Home from "./component/Com-4/Home"
import Product from "./component/Com-4/Product"
import Logout from './component/Parent/logout';
import Updateitems from './component/Com-4/Updateproduct'
import Navbar from "./component/Com-4/nav"
import { useEffect, useState } from 'react';
import Category from "./component/Com-4/Category"
import Login from "./component/Account/Login"
import Details from "./component/Com-4/Productdetails"

function App() { 
  
  return (
    <div className="App">
      <Router>   
       <Routes> 
         <Route path='/' element={<Login/>} />
         <Route path='/signup' element={<Signup/>}/>
         <Route path='/home' element={<Home/>} />
         <Route path='/product' element={<Product/>} />
         <Route path='/category' element={<Category/>} />
         <Route path='/items' element={<Details/>} />
         <Route path='/update' element={<Updateitems/>} />
          {/* <Route path='/logout' element={<Logout setLogin={setLogin} />} />  */}
       </Routes>
     </Router> 

    </div>

    
  );
}

export default App; 
