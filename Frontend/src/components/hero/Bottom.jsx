/* eslint-disable no-unused-vars */
import React from 'react'
import Buttons from '../common/Buttons'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
const Bottom = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className='h-1/5 overflow-hidden w-full flex-col justify-items-center '>
      <div className='h-0.5 w-[80%] md:w-[60%] bg-gray-300 mb-3 top-0'></div>
      <p className='font-sans font-medium text-gray-600 text-xl md:text-2xl'>{t('homePage.chooseLanguage')}</p>
      <div className='Container w-full flex justify-center mt-5 md:mt-2'>
        <Link onClick={() => {
          i18n.changeLanguage('en')
        }} to='/second'>
          <Buttons text={"English"} design={"px-2 md:px-6 py-2 cursor-pointer border-2 rounded-[5px] font-medium text-[20px] md:text-[24px] text-blue-950 border-gray-400 m-2 md:m-4 bg-white"} />
        </Link>
        <Link onClick={() => {
          i18n.changeLanguage('hi')
        }} to='/second'>
          <Buttons text={" हिन्दी(Hindi)"} design={"px-2 md:px-6 py-2 cursor-pointer border-2 rounded-[5px] font-medium text-[20px] md:text-[24px] text-blue-950 border-gray-400 m-2 md:m-4 bg-white"} />

        </Link>
        <Link>
          <Buttons text={"मराठी(Marathi)"} design={"px-2 md:px-6 py-2 cursor-pointer border-2 rounded-[5px] font-medium text-[20px] md:text-[24px] text-blue-950 border-gray-400 m-2 md:m-4 bg-white"} />

        </Link>
      </div>
    </div>
  )
}

export default Bottom