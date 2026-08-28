/* eslint-disable no-unused-vars */
import React from 'react'
import { ShieldAlert, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShieldInfoIcon from '../../assets/Shield';
const Consent = () => {
    const {t} = useTranslation()
  return (
    <div>
        <div className='flex gap-8 items-center justify-center'>
            {/* <span className=''> <ShieldAlert strokeWidth={1} color='#0a4382'  fill='white' size={48} /></span> */}
            <span><ShieldInfoIcon/></span>
            <span className='text-2xl text-blue-950 font-bold font-robot md:text-4xl'>{t('consentPage.title')}</span>
        </div>
        <div className='w-[90ch] mt-7 bg-gray-200 py-3 border rounded-2xl px-4'>
            <span className='text-4xl'>We will ask questions about your health and may use your previous medical document to prepare information for doctor</span>
            <span className='flex gap-2 text-xl items-center'><Volume2/> Listen</span>
        </div>
    </div>
  )
}

export default Consent