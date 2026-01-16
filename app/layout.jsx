import { Nunito, Fredoka } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
})

const fredoka = Fredoka({ 
  subsets: ['latin'],
  variable: '--font-fredoka',
})

export const metadata = {
  title: 'Leadis - Early Learning Disability Screening',
  description: 'An AI-powered, child-friendly screening platform that helps identify early developmental indicators—giving every child the support they deserve.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable}`}>
        {children}
      </body>
    </html>
  )
}
