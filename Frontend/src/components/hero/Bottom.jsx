/* eslint-disable no-unused-vars */
import React from 'react'
import Buttons from '../common/Buttons'

const Bottom = () => {
  return (
    <div className='h-[18%] bottom-0 overflow-hidden  w-full fixed z-100 flex-col justify-items-center '>
        <div className='h-0.5 w-[60%] bg-gray-300 mb-3 top-0'></div>
        <p className='font-sans font-medium text-gray-600 text-2xl'>Choose your language</p>
        <div className='Container w-full flex justify-center'>
            <Buttons text={"English"} design={"px-10 py-2 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-3 bg-white"} />
            
            <Buttons text={"Hindi"} design={"px-10 py-2 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-3 bg-white"} />

            <Buttons text={"Marathi"} design={"px-10 py-2 border-2 rounded-[5px] font-medium text-[24px] text-blue-950 border-gray-400 m-3 bg-white"} />
        </div>
    </div>
  )
}

export default Bottom