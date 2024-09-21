import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [label, setLabel] = useState('');

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file || !label) {
      alert('Please upload a file and enter a label first!');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to upload this file?');
    if (!confirmed) {
      return;
    }

    try {
      // Insert label into 'slot_details' table
      const { data: slotData, error: slotError } = await supabase
        .from('slot_details')
        .insert([{ label }]);

      if (slotError) {
        console.error('Error inserting slot label:', slotError);
        return;
      } else {
        console.log('Slot label successfully inserted:', slotData);
      }

      // Clear the 'attendee_details' table before uploading new data
      const { data: deleteData, error: deleteError } = await supabase
        .from('attendee_details')
        .delete()
        .neq('id', 0); // Assuming 'id' is a column in your table

      if (deleteError) {
        console.error('Error deleting old data:', deleteError);
        return;
      } else {
        console.log('Old data successfully deleted:', deleteData);
      }

      // Parse and upload file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Assuming the first sheet is the one we need
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet data to JSON format
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Filter the JSON data to include only 'name', 'email', and 'uid' columns
        const filteredData = jsonData.map(row => ({
          name: row.name,
          email: row.email,
          uid: row.uid,
        }));

        // Update the state with the filtered data
        setFilteredData(filteredData);

        // Upload the filtered data to the 'attendee_details' table
        const { data: supabaseData, error } = await supabase
          .from('attendee_details')
          .insert(filteredData);  // jsonData is an array of objects (rows)

        if (error) {
          console.error('Error uploading data:', error);
        } else {
          console.log('Data successfully uploaded to Supabase:', supabaseData);
          window.location.reload(); // Refresh the page
        }
      };

      // Read the uploaded file as binary string
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error('Error:', err);
    }
  };


  const handleDeleteAll = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all data?');
    if (!confirmed) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendee_details')
        .delete()
        .neq('id', 0); // Assuming 'id' is a column in your table

      if (error) {
        console.error('Error deleting data:', error);
      } else {
        console.log('All rows successfully deleted from Supabase:', data);
        window.location.reload(); // Refresh the page
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch data from 'attendee_details'
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('attendee_details')
        .select('name, email, uid, entry_time');
  
      if (attendeeError) {
        console.error('Error fetching attendee data:', attendeeError);
      } else {
        setFilteredData(attendeeData);
      }
  
      // Fetch the latest slot label from 'slot_details'
      const { data: slotData, error: slotError } = await supabase
        .from('slot_details')
        .select('label')
        .order('id', { ascending: false }) // Assuming 'id' is the primary key or a timestamp can be used
        .limit(1);  // Fetch the most recent label
  
      if (slotError) {
        console.error('Error fetching slot label:', slotError);
      } else if (slotData.length > 0) {
        setLabel(slotData[0].label);  // Set the latest slot label
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'download.xlsx');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
      <div className="w-full max-w-2xl p-4"> {/* Increased max-width */}
        <input
          type="text"
          placeholder="Enter Slot Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mb-4 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="mb-4 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <p className="text-sm text-gray-400 mb-4">Takes only .xlsx files</p>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const worksheet = XLSX.utils.json_to_sheet([{ name: '', email: '', uid: '' }]);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
              XLSX.writeFile(workbook, 'template.xlsx');
            }}
            className="p-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
          >
            Download Template
          </button>
          <button
            onClick={handleFileUpload}
            className="p-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Upload File
          </button>
          <button
            onClick={handleDeleteAll}
            className="p-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete All Data
          </button>
          <button
            onClick={handleDownload}
            className="p-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Download Data
          </button>
        </div>
      </div>
    
      <div className="bg-gray-800 text-white p-4 rounded mt-4 w-full max-w-6xl shadow-lg h-[600px] overflow-hidden dark:bg-gray-800 dark:text-white">
        {/* <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2 dark:border-gray-700">File Content Preview</h2> */}
        
        {/* Display Slot Label */}
        {label && (
          <div className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2 dark:border-gray-700">
            <strong>Slot Name:</strong> {label}
          </div>
        )}

        <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
          <table className="table-auto w-full">
            <thead className="sticky top-0 bg-gray-800 dark:bg-gray-800 z-10">
              <tr>
                <th className="px-4 py-2 border-b border-gray-700 dark:border-gray-700">Name</th>
                <th className="px-4 py-2 border-b border-gray-700 dark:border-gray-700">Email</th>
                <th className="px-4 py-2 border-b border-gray-700 dark:border-gray-700">UID</th>
                <th className="px-4 py-2 border-b border-gray-700 dark:border-gray-700">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-700 dark:hover:bg-gray-700">
                  <td className="border px-4 py-2 dark:border-gray-700">{row.name}</td>
                  <td className="border px-4 py-2 dark:border-gray-700">{row.email}</td>
                  <td className="border px-4 py-2 dark:border-gray-700">{row.uid}</td>
                  <td className="border px-4 py-2 dark:border-gray-700">{row.entry_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FileUpload;
