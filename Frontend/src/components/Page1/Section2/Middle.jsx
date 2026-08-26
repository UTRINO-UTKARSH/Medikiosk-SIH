/* eslint-disable no-unused-vars */
import React from 'react'
import Content from './Content'
import HeroImage from './HeroImage'
import Buttons from './Buttons'

const Middle = () => {
  return (
    <div className='w-full h-[70%] flex-col justify-center justify-items-center p-8'>
        <Content/>
        <HeroImage/>
        <Buttons/>
    </div>
  )
}

export default Middle