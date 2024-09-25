import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from './Layout'
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"
import { Button } from "./ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

export default function Statistics() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    gender: 'all',
    participantType: 'all',
    attendance: 'all',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [data, filters, searchTerm])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('attendee_details')
        .select('*')
      
      if (error) throw error
      
      // Process the data
      const processedData = data.map(item => ({
        ...item,
        participantType: item['Participants Type']?.toLowerCase() === 'student' ? 'Student' : 'Professional',
        teamRole: ['team leader', 'team member'].includes(item['Team Leader/Member']?.toLowerCase()) ? item['Team Leader/Member'] : 'Mentor',
        isPresent: !!item.entry_time
      }))
      
      setData(processedData)
      setFilteredData(processedData)
    } catch (error) {
      console.error('Error fetching data:', error.message)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = data

    if (filters.gender !== 'all') {
      result = result.filter(item => item['gender']?.toLowerCase() === filters.gender.toLowerCase())
    }

    if (filters.participantType !== 'all') {
      result = result.filter(item => item.participantType.toLowerCase() === filters.participantType.toLowerCase())
    }

    if (filters.attendance !== 'all') {
      result = result.filter(item => item.isPresent === (filters.attendance === 'present'))
    }

    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredData(result)
  }

  const getStatistics = () => {
    const total = filteredData.length
    const present = filteredData.filter(item => item.isPresent).length
    const absent = total - present

    const students = filteredData.filter(item => item.participantType === 'Student').length
    const professionals = filteredData.filter(item => item.participantType === 'Professional').length

    const teamLeaders = filteredData.filter(item => item.teamRole.toLowerCase() === 'team leader').length
    const teamMembers = filteredData.filter(item => item.teamRole.toLowerCase() === 'team member').length
    const mentors = filteredData.filter(item => item.teamRole.toLowerCase() === 'mentor').length

    return { total, present, absent, students, professionals, teamLeaders, teamMembers, mentors }
  }

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics')
    XLSX.writeFile(workbook, 'statistics.xlsx')
  }

  const stats = getStatistics()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Statistics</h1>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.professionals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamLeaders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mentors}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={filters.gender} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="participantType">Participant Type</Label>
              <Select 
                value={filters.participantType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, participantType: value }))}
              >
                <SelectTrigger id="participantType">
                  <SelectValue placeholder="Select participant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="attendance">Attendance</Label>
              <Select 
                value={filters.attendance} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, attendance: value }))}
              >
                <SelectTrigger id="attendance">
                  <SelectValue placeholder="Select attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Institute Name</TableHead>
                  <TableHead>Participant Type</TableHead>
                  <TableHead>Team Role</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Entry Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item['name']}</TableCell>
                    <TableCell>{item['Team Name']}</TableCell>
                    <TableCell>{item['Institute Name']}</TableCell>
                    <TableCell>{item.participantType}</TableCell>
                    <TableCell>{item.teamRole}</TableCell>
                    <TableCell>{item['gender']}</TableCell>
                    <TableCell>{item.isPresent ? 'Present' : 'Absent'}</TableCell>
                    <TableCell>{item.entry_time ? new Date(item.entry_time).toLocaleString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  )
}