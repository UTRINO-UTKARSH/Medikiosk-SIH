/* eslint-disable no-unused-vars */
import React from 'react'

const Bottom = () => {
  return (
    <div className='h-[20%] w-full fixed z-100 flex-col justify-items-center '>
        <div className='h-0.5 w-[80%] bg-gray-300 mb-5'></div>
        <p className='font-sans font-medium text-gray-600 text-2xl'>Choose your language</p>
        <div className='Container w-full flex justify-center'>
            <button className='px-10 py-4 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-6 bg-white'>English</button>
            <button className='px-10 py-4 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-6 bg-white'>Hindi</button>
            <button className='px-10 py-4 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-6 bg-white'>Marathi</button>
        </div>
    </div>
  )
}

export default Bottom