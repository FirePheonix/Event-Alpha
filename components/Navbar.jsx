"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { signIn, signOut, useSession, getProviders} from 'next-auth/react'

const Navbar = () => {
    const {data: session} = useSession();
    const [userStats, setUserStats] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const [providers, setProviders] = useState(null);
    const [toggleDropdown, setToggleDropdown] = useState(false);
    
    useEffect(() => {
        const setupProviders = async () => {
            try {
                const response = await getProviders();
                setProviders(response);
            } catch (error) {
                console.error("Error fetching providers:", error);
                // Fallback for testing - you can remove this in production
                setProviders({ google: { id: 'google', name: 'Google' } });
            }
        }

        setupProviders();
        
        // Fetch user stats if logged in
        if (session) {
            fetch('/api/leaderboard')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUserStats(data.userStats);
                    }
                })
                .catch(err => console.error('Error fetching user stats:', err));
        }

        // Add scroll listener
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [session]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 flex justify-between items-center w-full py-3 px-6 sm:px-16 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-lg bg-black/20' : 'bg-transparent'
      }`}
    >
        <Link href="/" className='flex gap-2 items-center'>
            <Image 
                src="/assets/images/logo-BuildWars.png"
                alt="BuildWars Logo"
                width={140}
                height={45}
                className="max-sm:w-28"
            />
        </Link>



        {/*  Desktop Navigation  */}
        <div className='sm:flex hidden'>
            {session?.user ? (
                <div className='flex items-center gap-4'>
                    {/* User Points */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
                        <span className="text-white text-base font-bold">{userStats?.totalPoints || 0} Pts</span>
                        <span className="text-yellow-300 text-base">🏆</span>
                    </div>
                    
                    <Link 
                        href="/leaderboard" 
                        className="text-center text-white font-semibold transition-all duration-500 rounded-full shadow-lg hover:shadow-xl"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #E55D87 0%, #5FC3E4 51%, #E55D87 100%)',
                            backgroundSize: '200% auto',
                            padding: '10px 30px',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundPosition = 'right center'}
                        onMouseLeave={(e) => e.target.style.backgroundPosition = 'left center'}
                    >
                        Leaderboard
                    </Link>
                    
                    {/* Admin Dashboard Button */}
                    {session?.user?.email === 'shubhsoch@gmail.com' && (
                        <Link href="/admin/dashboard" className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition">
                            Admin Dashboard
                        </Link>
                    )}
                    
                    <div className="relative">
                        <Image 
                            src={session?.user.image}
                            alt="profile"
                            height={40}
                            width={40}
                            className="rounded-full border-2 border-gray-600 cursor-pointer"
                            onClick={() => setToggleDropdown((prev) => !prev)}
                        />
                        {toggleDropdown && (
                            <div className="absolute right-0 top-full mt-3 p-3 rounded-lg border min-w-[120px] flex flex-col gap-2 shadow-lg" style={{ backgroundColor: '#000000', borderColor: '#ffffff' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setToggleDropdown(false);
                                        signOut();
                                    }}
                                    className="w-full rounded-full border py-1.5 px-4 transition-all text-center text-sm font-inter flex items-center justify-center"
                                    style={{ borderColor: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ): (
                <>
                    {providers &&  
                        Object.values(providers).map((provider) => (
                            <button
                                type="button"
                                key={provider.name}
                                onClick={() => signIn(provider.id)}
                                className="rounded-full border py-1.5 px-5 transition-all text-center text-sm font-inter flex items-center justify-center"
                                style={{ borderColor: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}
                            >
                                Sign In
                            </button>
                        ))
                    }
                </>
            )}
        </div>

        {/* Mobile Navigation */}
        <div className='sm:hidden flex items-center gap-3 relative'>
            {session?.user ? (
                <div className='flex items-center gap-3'>
                    {/* User Points - Mobile */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg">
                        <span className="text-white text-sm font-bold">{userStats?.totalPoints || 0} Pts</span>
                        <span className="text-yellow-300 text-sm">🏆</span>
                    </div>
                    
                    {/* Leaderboard Button - Mobile */}
                    <Link 
                        href="/leaderboard" 
                        className="text-center text-white font-semibold transition-all duration-500 rounded-full shadow-lg hover:shadow-xl text-sm"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #E55D87 0%, #5FC3E4 51%, #E55D87 100%)',
                            backgroundSize: '200% auto',
                            padding: '6px 16px',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundPosition = 'right center'}
                        onMouseLeave={(e) => e.target.style.backgroundPosition = 'left center'}
                    >
                        Leaderboard
                    </Link>
                    
                    <Image 
                        src={session?.user.image}
                        alt="profile"
                        height={37}
                        width={37}
                        className="rounded-full border-2 border-gray-600 cursor-pointer"
                        onClick={() => setToggleDropdown((prev) => !prev)}
                    />
                    {toggleDropdown && (
                        <div className='absolute right-0 top-full mt-3 p-3 rounded-lg border min-w-[140px] flex flex-col gap-2 shadow-lg' style={{ backgroundColor: '#000000', borderColor: '#ffffff' }}>
                            {/* Admin Dashboard Button - Mobile */}
                            {session?.user?.email === 'shubhsoch@gmail.com' && (
                                <Link 
                                    href="/admin/dashboard" 
                                    className="w-full bg-red-700 hover:bg-red-600 text-white py-1.5 px-4 rounded-lg text-sm font-semibold transition text-center"
                                    onClick={() => setToggleDropdown(false)}
                                >
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setToggleDropdown(false);
                                    signOut();
                                }}
                                className="w-full rounded-full border py-1.5 px-4 transition-all text-center text-sm font-inter flex items-center justify-center"
                                style={{ borderColor: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {providers &&  
                        Object.values(providers).map((provider) => (
                            <button
                                type="button"
                                key={provider.name}
                                onClick={() => signIn(provider.id)}
                                className="rounded-full border py-1.5 px-5 transition-all text-center text-sm font-inter flex items-center justify-center"
                                style={{ borderColor: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}
                            >
                                Sign In
                            </button>
                        ))
                    }
                </>
            )}
        </div>
    </nav>
  )
}

export default Navbar