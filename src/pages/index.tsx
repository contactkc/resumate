import type { NextPage } from 'next';
import React from 'react';

const Home: NextPage = () => {
    return (
        <>
            <div className="min-h-screen flex justify-center p-12">
                <div className="max-w-2xl w-full">
                    <h1 className="text-2xl mb-2">resumate</h1>
                    <p className="text-sm text-zinc-400 font-light">get instant feedback on your resume against any job description</p>
                </div>
            </div>
        </>
    );
}

export default Home;