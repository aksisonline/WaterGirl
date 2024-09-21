import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from './Layout'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('volunteer_login')
      .select('id, email, name')
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setUsers(data || [])
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
  
    try {
      const { error: insertError } = await supabase
        .from('volunteer_login')
        .insert([
          { name: name.trim(), email: email.trim(), password: password.trim() }
        ])
  
      if (insertError) {
        throw new Error(insertError.message)
      }
  
      setName('')
      setEmail('')
      setPassword('')
      fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId)
    const confirmed = window.confirm(`Are you sure you want to delete the user with email: ${user.email}?`)
    if (!confirmed) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('volunteer_login')
        .delete()
        .eq('id', userId)
      if (error) {
        throw new Error(error.message)
      }
      fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Current Users</h2>
          {loading && <p>Loading users...</p>}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  user.email === 'chandu.tendul@gmail.com' ? null : (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  )
}