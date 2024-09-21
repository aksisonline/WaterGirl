import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import * as XLSX from 'xlsx'
import Layout from './Layout'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, Download, Upload, Trash2 } from "lucide-react"

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
        .select('name, email, uid, entry_time')
  
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

        const filteredData = jsonData.map(row => ({
          name: row.name,
          email: row.email,
          uid: row.uid,
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

  const handleDeleteAll = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all data?')
    if (!confirmed) return

    try {
      await supabase.from('attendee_details').delete().neq('id', 0)
      fetchData()
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
            <Button variant="destructive" onClick={handleDeleteAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Entry Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
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