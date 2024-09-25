import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import * as XLSX from 'xlsx'
import Layout from './Layout'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, Download, Upload, Trash2} from "lucide-react"

export default function FileUpload() {
  const [file, setFile] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [label, setLabel] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('attendee_details')
        .select(`
          Team_Name: "Team Name",
          Team_ID: "Team ID",
          Institute_Name: "Institute Name",
          Participants_Type: "Participants Type",
          Team_Leader_Member: "Team Leader/Member",
          name,
          email,
          phone,
          gender,
          uid,
          entry_time
        `)
  
      if (attendeeError) {
        setError(attendeeError.message)
      } else {
        setFilteredData(attendeeData)
      }
  
      const { data: slotData, error: slotError } = await supabase
        .from('slot_details')
        .select('label')
        .order('id', { ascending: false })
        .limit(1)
  
      if (slotError) {
        setError(slotError.message)
      } else if (slotData.length > 0) {
        setLabel(slotData[0].label)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleFileUpload = async () => {
    if (!file || !label) {
      setError('Please upload a file and enter a label first!')
      return
    }

    const confirmed = window.confirm('Are you sure you want to upload this file?')
    if (!confirmed) return

    try {
      await supabase.from('slot_details').insert([{ label }])
      await supabase.from('attendee_details').delete().neq('id', 0)

      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        console.log('jsonData', jsonData);
        const filteredData = jsonData.map(row => ({
          'Team Name': row['Team Name'],
          'Team ID': row['Team ID'],
          'Institute Name': row['Institute Name'],
          'Participants Type': row['Participants Type'],
          'Team Leader/Member': row['Team Leader/Member'],
          name: row.Name,
          email: row.email,
          phone: row.phone,
          gender: row.gender,
        }))

        setFilteredData(filteredData)

        await supabase.from('attendee_details').insert(filteredData)
        fetchData()
      }

      reader.readAsBinaryString(file)
    } catch (err) {
      setError(err.message)
    }
  }
  const handleClearEntryTime = async () => {
    const confirmed = window.confirm('Are you sure you want to clear the entry time for all records?')
    if (!confirmed) return

    try {
      const { data, error } = await supabase
        .from('attendee_details')
        .update({ entry_time: null })
        .neq('id', 0)

      if (error) {
        setError(error.message)
      } else {
        fetchData()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, 'download.xlsx')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Slot Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter Slot Label"
            />
          </div>
          <div>
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">Takes only .xlsx files</p>
          <div className="flex space-x-4">
            <Button onClick={() => {
              const worksheet = XLSX.utils.json_to_sheet([{ name: '', email: '', uid: '' }])
              const workbook = XLSX.utils.book_new()
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
              XLSX.writeFile(workbook, 'template.xlsx')
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button onClick={handleFileUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button variant="destructive" onClick={handleClearEntryTime}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Entry Time
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Data
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">File Content Preview</h2>
          {label && (
            <p className="text-lg font-semibold mb-2">
              <strong>Slot Name:</strong> {label}
            </p>
          )}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Team ID</TableHead>
                  <TableHead>Institute Name</TableHead>
                  <TableHead>Participants Type</TableHead>
                  <TableHead>Team Leader/Member</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Entry Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row['Team_Name']}</TableCell>
                    <TableCell>{row['Team_ID']}</TableCell>
                    <TableCell>{row['Institute_Name']}</TableCell>
                    <TableCell>{row['Participants_Type']}</TableCell>
                    <TableCell>{row['Team_Leader_Member']}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>{row.uid}</TableCell>
                    <TableCell>{row.entry_time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  )
}