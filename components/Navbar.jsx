"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { signIn, signOut, useSession, getProviders} from 'next-auth/react'

const Navbar = () => {
    const {data: session} = useSession();

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
    }, []);

  return (
    <nav className='flex justify-between items-center w-full mb-16 pt-3'>
        <Link href="/" className='flex gap-2 items-center'>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">V</span>
            </div>
            <p className='max-sm:hidden font-satoshi font-semibold text-lg text-white tracking-wide'>VibeBet</p>
        </Link>

        {/*  Desktop Navigation  */}
        <div className='sm:flex hidden'>
            {session?.user ? (
                <div className='flex gap-3 md:gap-5'>
                    <button type='button' onClick={signOut} className='rounded-full border border-white bg-transparent py-1.5 px-5 text-white transition-all hover:bg-white hover:text-black text-center text-sm font-inter flex items-center justify-center'>
                        Sign Out
                    </button>

                    <Link href="/profile">
                        <Image 
                            src={session?.user.image}
                            alt="profile"
                            height={37}
                            width={37}
                            className="rounded-full"
                        />
                    </Link>
                </div>
            ): (
                <>
                    {providers &&  
                        Object.values(providers).map((provider) => (
                            <button
                                type="button"
                                key={provider.name}
                                onClick={() => signIn(provider.id)}
                                className='rounded-full border border-white bg-white py-1.5 px-5 text-black transition-all hover:bg-black hover:text-white text-center text-sm font-inter flex items-center justify-center'
                            >
                                Sign In
                            </button>
                        ))
                    }
                </>
            )}
        </div>

        {/* Mobile Navigation */}
        <div className='sm:hidden flex relative'>
            {session?.user ? (
                <div className='flex'>
                    <Image 
                            src={session?.user.image}
                            alt="profile"
                            height={37}
                            width={37}
                            className="rounded-full"
                            onClick={() => setToggleDropdown((prev) => !prev)}
                    />
                    {toggleDropdown && (
                        <div className='absolute right-0 top-full mt-3 w-full p-5 rounded-lg bg-gray-900 border border-gray-700 min-w-[210px] flex flex-col gap-2 justify-end items-end shadow-lg'>
                            <Link 
                                className='text-sm font-inter text-gray-300 hover:text-white font-medium'
                                href="/profile"
                                onClick={() => setToggleDropdown(false)}
                            >
                                My Profile
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setToggleDropdown(false);
                                    signOut();
                                }}
                                className='mt-5 w-full rounded-full border border-white bg-white py-1.5 px-5 text-black transition-all hover:bg-black hover:text-white text-center text-sm font-inter flex items-center justify-center'
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
                                className='rounded-full border border-white bg-white py-1.5 px-5 text-black transition-all hover:bg-black hover:text-white text-center text-sm font-inter flex items-center justify-center'
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
