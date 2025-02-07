import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from 'react-csv';

import { Search } from 'lucide-react';
import { Filter } from 'lucide-react';
import { Settings } from 'lucide-react';
import { Eye } from 'lucide-react';
import { FolderInput } from 'lucide-react';
import { EllipsisVertical } from 'lucide-react';
import { motion } from "framer-motion";
const ResignedEmployees1 = () => {
  const [resignedEmployees, setResignedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
    
      // Separate state for settings (different from filters)
      const [settings, setSettings] = useState({
        groupBy: '',  // For grouping employees (designation, department, etc.)
        column1: true,  // Name column
        column2: true,  // ID column
        column3: true,  // Designation column
        column4: true,  // Department column
        column5: true,  // Email column
        column6: true,  // Personal Email column
        column7: true,  // Office Mobile Number column
        column8: true,  // Current Role column
      });
      const [filterSheet,setFilterSheet] = useState(false);
      const [filters,setFilters] = useState({
        empDepartment: '',
        empDesignation: '',
        empJoinDate: '',
        empStatus: '',
        role: '',
        workLocation:'',
    
      });

  // Function to fetch resigned employees
  const fetchResignedEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/adduser/fetch_resigned_employees"); // API endpoint
      console.log(response.data)
      setResignedEmployees(response.data);
    } catch (error) {
      console.error("Error fetching resigned employees:", error);
    }
  };

  useEffect(() => {
    fetchResignedEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'role') {
      fetchRolePermissions(value);
    }

   
  };

  const handleFilter=(e)=>{
    const {name, value}= e.target;
    setFilters({...filters,[name]:value})
  }
  const handleSearch = (e)=>{
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const searchResults  = allEmployeeData.filter((employee) => 
      employee.emp_full_name.toLowerCase().includes(value)
    );
    
    setFilteredEmployees(searchResults );
  }
  const resetSearch= ()=>{
    setSearchTerm('');
    setFilteredEmployees(allEmployeeData);
  }
  const headers = [
    { label: "ID", key: "emp_id" },
    { label: "Full Name", key: "employee_name" },
    { label: "Last Working Day", key: "last_working_day" },
    { label: "Work Period", key: "total_work_period" },
    { label: "Last CTC", key: "last_ctc_drawn" },
    { label: "Last Designation", key: "last_designation" },
    { label: "Reason for Resignation", key: "reason_for_resignation" },
    { label: "Feedback", key: "feedback" },
    { label: "Exit Interview Done", key: "exit_interview_done" },
    { label: "Notice Period Served", key: "notice_period_served" },
  ];
  
  return (
    <div>
          {/** search and filter row */}
          <div className="flex justify-between items-center mt-10 ml-0 ">  
             {/** search */}
           <div className='border-2 flex gap-1 p-2 items-center border-gray-400 rounded-lg'>
             <Search className='text-gray-600 size-4'/>
             <input
              type="text" name='search'
              placeholder="Search Employee"
              className="border-none bg-transparent outline-none rounded-lg w-96 text-sm text-gray-600"
              value={searchTerm}
              onChange={handleSearch}
              />
               {searchTerm && (
                <button onClick={resetSearch} 
                className='text-gray-600'
                >
                  <XCircle/>
                </button>
              )}
    

           </div>
           {(Object.values(filters).some(value => value !== '')) && (
  <button
    onClick={resetFilters}
    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
  >
    Reset
  </button>
)}

           <div className='flex relative'>
     
        <button
          className=" border-2 border-gray-300 p-2 flex"
          onClick={() => setFilterSheet(true)}
        >
          <Filter  className='size-4' />
           <div className='rounded-full bg-indigo-400 absolute size-4 top-1 left-5 text-xs text-white'>
            {Object.values(filters).filter(value=>value !== '').length}</div>
        </button>
        
        <button
          className=" border-2 border-l-0 border-gray-300 p-2 flex"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Settings className='size-4' /> 
          <div className='rounded-full bg-indigo-400 absolute size-4 top-1 left-14 text-xs text-white'> {Object.values(settings).filter(value=>value !== '').length}</div>
        </button><button
          className=" border-2 border-l-0 border-gray-300 p-2 flex"
          onClick={() => setShowDialog(true)}
        >
          <Eye className='size-4' />
        </button>
        <button
          className=" border-2 border-l-0 border-gray-300 p-2 flex">
        <CSVLink
          data={resignedEmployees}  // <-- Using resigned employee here
          headers={headers}
          filename={"employees.csv"}
        >
          <FolderInput className='size-4' />
        </CSVLink>
        </button>
           </div>
      </div>
      <div className="overflow-x-auto border border-gray-300 mt-5 rounded-lg">
     
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-primary-color text-btn-text-color font-semibold">
        <tr className="bg-indigo-400">
              <th className="py-2 px-3 text-white text-left">ID</th>
              <th className="py-2 px-3 text-white text-left">Full Name</th>
              <th className="py-2 px-3 text-white text-left">Last Working Day</th>
              <th className="py-2 px-3 text-white text-left">Work Period</th>
              <th className="py-2 px-3 text-white text-left">Last CTC</th>
              <th className="py-2 px-3 text-white text-left">Last Designation</th>
              <th className="py-2 px-3 text-white text-left">Reason</th>
              <th className="py-2 px-3 text-white text-left">Feedback</th>
              <th className="py-2 px-3 text-white text-left">Exit Interview</th>
              <th className="py-2 px-3 text-white text-left">Notice Period Served</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {resignedEmployees.length > 0 ? (
              resignedEmployees.map((emp) => (
                <tr key={emp.id} className="bg-white hover:bg-gray-100">
                  <td className="py-2 px-3">{emp.emp_id}</td>
                  <td className="py-2 px-3">{emp.employee_name}</td>

                  <td className="py-2 px-3">{new Date(emp.last_working_day).toLocaleDateString("en-GB")}</td>
                  <td className="py-2 px-3">{emp.total_work_period}</td>
                  <td className="py-2 px-3">{emp.last_ctc_drawn}</td>
                  <td className="py-2 px-3">{emp.last_designation}</td>
                  <td className="py-2 px-3">{emp.reason_for_resignation}</td>
                  <td className="py-2 px-3">{emp.feedback || "N/A"}</td>
                  <td className="py-2 px-3">{emp.exit_interview_done ? "Yes" : "No"}</td>
                  <td className="py-2 px-3">{emp.notice_period_served ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-3 text-center">
                  No resigned employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResignedEmployees1;
