import React,{useState} from 'react';
import Auth from './components/Auth';
import PetApp from './components/PetApp.jsx';
function App(){const[userLogged,setUserLogged]=useState(false);return userLogged?<PetApp/>:<Auth onLoginSuccess={()=>setUserLogged(true)}/>;}export default App;