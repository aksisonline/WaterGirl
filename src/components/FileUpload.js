import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      alert('Please upload a file first!');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to upload this file?');
    if (!confirmed) {
      return;
    }

    // Parse the file
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
        uid: row.uid 
      }));

      // Update the state with the filtered data
      setFilteredData(filteredData);

      try {
        // Send data to Supabase table (replace 'your_table' with actual table name)
        const { data: supabaseData, error } = await supabase
          .from('attendee_details')
          .insert(filteredData);  // jsonData is an array of objects (rows)

        if (error) {
          console.error('Error uploading data:', error);
        } else {
          console.log('Data successfully uploaded to Supabase:', supabaseData);
          window.location.reload(); // Refresh the page
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    // Read the uploaded file as binary string
    reader.readAsBinaryString(file);
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
      const { data, error } = await supabase
        .from('attendee_details')
        .select('name, email, uid, entry_time');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setFilteredData(data);
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
      <div className="w-full max-w-md p-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="mb-4 p-2 w-full bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <div className="flex space-x-4">
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
    
      <div className="bg-gray-800 text-white p-4 rounded mt-4 w-full max-w-4xl shadow-lg h-[600px] overflow-hidden dark:bg-gray-800 dark:text-white">
        <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2 dark:border-gray-700">File Content Preview:</h2>
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
