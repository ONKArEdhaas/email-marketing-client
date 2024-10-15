import React from 'react'
import Home from './Home'
import Navbar from './Navbar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';

const App = () => {
  return <>
    <Navbar />
    <Home />
    <Footer />
    <ToastContainer />

  </>
}

export default App