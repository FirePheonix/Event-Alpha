import "./globals.css";
import Navbar from "components/Navbar";
import Provider from "components/Provider";
import React from 'react'


export const metadata = {
    title: "Build Wars",
    description: "One prompt. Four contenders. Who builds it the best? The ultimate coding tool competition platform."
}

const RootLayout = ({children}) => {
  return (
    <html lang = "en">
        <body className="min-h-screen" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
            <Provider>
                <main className="relative z-10 flex justify-center items-center flex-col w-full min-h-screen">
                    <Navbar />
                    {children}
                </main>
            </Provider>
        </body>
    </html>
  )
}

export default RootLayout;