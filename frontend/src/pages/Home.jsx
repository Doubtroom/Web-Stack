import React from 'react'
import Card from '../components/Card'

const Home = () => {
    
  return (
      <div>
        <div className='mt-32 flex flex-col justify-center items-center'>
            <h2 className='text-2xl font-semibold mb-1 font-custom-font1'>Most recent Queries</h2>
            <div className=' border border-t-2 border-blue-800 w-1/2' />
        </div>
        <section className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 mb-5">
            <Card/>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
        </section>
    </div>
  )
}

export default Home