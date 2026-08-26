/* eslint-disable no-unused-vars */
import React from 'react'
import Navbar from './components/Page1/Section1/Navbar'
import Bottom from './components/Page1/Section3/Bottom'
import Middle from './components/Page1/Section2/Middle'

const App = () => {
  return (
    <div className='parent h-screen w-full bg-gray-100 content-'>
      <Navbar/>
      <Middle/>
      <Bottom/>
    </div>
  )
}

export default App