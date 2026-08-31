/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ShieldInfoIcon from '../../assets/Shield';
import { useToast } from '../common/Toast';

const Consent = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    
    const texttoread = t('consentPage.consent');

    // Ensure text-to-speech stops if the user leaves this page
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speech = () => {
        if (!('speechSynthesis' in window)) {
            toast.error("Your browser doesn't support text to speech");
            return;
        }
        
        window.speechSynthesis.cancel(); // Stop any currently playing speech
        
        const utterance = new SpeechSynthesisUtterance(texttoread);
        const currentLang = i18n.resolvedLanguage || i18n.language;
        
        if (currentLang === 'hi') {
            utterance.lang = 'hi-IN';
        } else if (currentLang === 'mr') {
            utterance.lang = 'mr-IN';
        } else {
            utterance.lang = 'en-IN';
        }
        
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleProceed = () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        navigate('/dashboard',{replace:true});
    };

    const handleBack = () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        navigate(-1);
    };

    return (
        <div className='min-h-screen flex flex-col items-center justify-center py-8 px-4'>
            <div className='flex gap-8 items-center justify-center'>
                <span><ShieldInfoIcon /></span>
                <span className='text-2xl text-blue-950 font-bold font-robot md:text-4xl'>
                    {t('consentPage.title')}
                </span>
            </div>
            
            <div className='w-full max-w-2xl mt-7 bg-[#eff3f8] p-7 flex flex-col gap-10 shadow-3xl rounded-2xl'>
                <span className='text-xl text-[#44474a]'>{texttoread}</span>
                
                <button 
                    onClick={speech} 
                    className='flex bg-blue-300 max-w-fit p-4 rounded-lg cursor-pointer gap-2 text-xl items-center hover:bg-blue-400 transition-colors'
                >
                    <Volume2 />
                    {t('consentPage.listen')}
                </button>
                
                <div className='flex gap-4 mt-6 pt-6 border-t border-gray-300'>
                    <button 
                        onClick={handleBack}
                        className='flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition cursor-pointer'
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleProceed}
                        className='flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-950 hover:bg-blue-900 transition cursor-pointer'
                    >
                        Proceed to Dashboard <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Consent;