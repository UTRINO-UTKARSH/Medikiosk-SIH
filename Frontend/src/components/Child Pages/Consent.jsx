/* eslint-disable no-unused-vars */
import React from 'react'
import { ShieldAlert, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShieldInfoIcon from '../../assets/Shield';
import { useToast } from '../common/Toast';
const Consent = () => {
    const { t, i18n } = useTranslation()
    const toast = useToast()
    const texttoread = t('consentPage.consent')
    const listen = t('consentPage.listen');
    const speech = () => {
        if (!('speechSynthesis' in window)) {
            toast.error("Your browser doesn't support text to speech")
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(texttoread)
        const currentLang = i18n.resolvedLanguage || i18n.language
        if (currentLang === 'hi') {
            utterance.lang = 'hi-IN';
        } else if (currentLang === 'mr') {
            utterance.lang = 'mr-IN';
        } else {
            utterance.lang = 'en-IN';
        }
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance)
    }


    return (
        <div>
            <div className='flex gap-8 items-center justify-center'>
                {/* <span className=''> <ShieldAlert strokeWidth={1} color='#0a4382'  fill='white' size={48} /></span> */}
                <span><ShieldInfoIcon /></span>
                <span className='text-2xl text-blue-950 font-bold font-robot md:text-4xl'>{t('consentPage.title')}</span>
            </div>
            <div className='w-[67ch] mt-7 bg-[#eff3f8] p-7 flex flex-col gap-10 shadow-3xl rounded-2xl'>
                <span className='text-xl text-[#44474a]'>{t('consentPage.consent')}</span>
                <button onClick={speech} className='flex bg-blue-300 max-w-fit p-4 rounded-lg cursor-pointer gap-2 text-xl items-center'><Volume2 />{t('consentPage.listen')}</button>
            </div>
        </div>
    )
}

export default Consent