import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react'; // Import Lottie component
// import { BookOpen } from 'lucide-react'; // No longer needed
import { AuthContext } from '../auth/authProvider';

import animationData from '../assets/notfound.json'; // Adjust the path if your assets folder is structured differently

const NotFound = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const defaultOptions = {
        loop: true, // Set to true if you want the animation to loop
        autoplay: true, // Set to true if you want the animation to play automatically
        animationData: animationData, // The imported JSON data
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice' // Maintain aspect ratio
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-12 text-center ">
            {/* Lottie Animation Placeholder */}
            <div className="flex justify-center w-64 h-64 mb-8"> {/* Adjust width and height as needed */}
                <Lottie
                    animationData={animationData}
                    loop={true} // Or use defaultOptions.loop
                    autoplay={true} // Or use defaultOptions.autoplay
                    style={{ width: '100%', height: '100%' }} // Ensure Lottie fills its container
                />
            </div>

            {/* Humorous Headline */}
            <h1 className="mb-4 text-5xl font-extrabold leading-tight text-gray-800">
                Oops! This Page Decided to Take an Unscheduled Vacation.
            </h1>

            {/* Humorous Body Text */}
            <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
                We've checked our ledgers, audited our files, and even peered under the desk,
                but this page just isn't here. It seems to have wandered off like a decimal point in a hurry!
            </p>

            {/* Suggestions Section */}
            <div className="space-y-6">
                <p className="text-lg font-semibold text-gray-700">
                    Don't let this little accounting anomaly throw off your whole day!
                    Let's get you back to where the numbers *do* add up:
                </p>
                <button
                    onClick={() => { user.role === 'admin' ? navigate('/admin/dashboard') : navigate('/dashboard'); }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white transition transform bg-orange-500 rounded-lg shadow-lg hover:bg-orange-600 hover:scale-105"
                >
                    {/* You can add a simple icon here if you still want one, e.g., from lucide-react */}
                    {/* <BookOpen size={24} /> */}
                    Go to your Dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFound;