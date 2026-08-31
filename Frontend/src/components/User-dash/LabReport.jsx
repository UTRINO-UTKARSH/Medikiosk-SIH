/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'

const LabReport = () => {
  const [reportId, setReportId] = useState('')

  return (
    <div className='flex flex-col gap-6 items-center justify-center py-50'>
        <div className='flex flex-col gap-7 items-center justify-center'>
            <span className='text-6xl font-greet font-bold text-blue-950'>Lab Reports</span>
            <span className='text-xl font-greet  text-zinc-400'>Enter your Report ID to view or download your results</span>
        </div>
        <div className='bg-white p-7 rounded-2xl w-full max-w-2xl'>
            <label htmlFor='reportId' className='block text-sm font-semibold text-blue-950 mb-2'>
                Report ID
            </label>
            <div className='flex gap-3'>
                <div className='relative flex-1'>
                    <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400' />
                    <input
                        id='reportId'
                        type='text'
                        value={reportId}
                        onChange={(e) => setReportId(e.target.value)}
                        placeholder='E.g., LAB-2023-XYZ'
                        className='w-full bg-zinc-100 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-blue-950/20'
                    />
                </div>
                <button className='flex items-center gap-2 bg-blue-950 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-blue-900 transition-colors whitespace-nowrap'>
                    Search Results
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
        <div className='flex gap-1'>
            <span className='text-zinc-800'>Need Help in finding your ID?</span><span className='text-blue-950 underline'>Check your registration form</span>
        </div>
    </div>
  )
}

export default LabReport