import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Users, Upload, LogOut, Menu } from "lucide-react"
import { supabase } from '../lib/supabaseClient'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('isAuthenticated')
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err.message)
    }
  }

  const menuItems = [
    { icon: <Users className="mr-2 h-4 w-4" />, label: 'Admin Panel', path: '/admin' },
    { icon: <Upload className="mr-2 h-4 w-4" />, label: 'File Upload', path: '/upload' },
  ]

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark', !isDarkMode)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-dark-background' : 'bg-background'}`}>
      <Card className={`w-64 h-full ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <ScrollArea className="flex-grow">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.path)
                    setIsMenuOpen(false)
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
          </ScrollArea>
          <Button variant="outline" className="w-full mt-4" onClick={toggleDarkMode}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
      <main className="flex-1 p-6 overflow-auto">
        <div className="md:hidden p-4">
          <Button variant="ghost" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <Card className="h-full">
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}