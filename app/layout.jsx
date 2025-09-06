import "./globals.css";
import Navbar from "components/Navbar";
import Provider from "components/Provider";
import React from 'react'


export const metadata = {
    title: "VibeBet",
    description: "The ultimate coding tool prediction game. Guess the winning tool, vote on previews, and climb the leaderboard!"
}

const RootLayout = ({children}) => {
  return (
    <html lang = "en">
        <body className="bg-black">
            <Provider>
                <main className="relative z-10 flex justify-center items-center flex-col max-w-7xl mx-auto sm:px-16 px-6 min-h-screen">
                    <Navbar />
                    {children}
                </main>
            </Provider>
        </body>
    </html>
  )
}

export default RootLayout;