import React from 'react'

const LoadingBar = () => {
  return (
    <div className='w-[80%] h-3 bg-gray-300 rounded-2xl absolute bottom-0'>
        <div className='w-[10%] bg-blue-950 h-full rounded-2xl '></div>
    </div>
  )
}

export default LoadingBar