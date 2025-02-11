import express from 'express';
import Attendance from '../models/attendance.js';
import Shift from '../models/shiftingData.js';
const addAttendance = express.Router();


// 📌 Demo Route: Add a Shift Record
addAttendance.post("/addShift", async (req, res) => {
  try {
    const { shift_in, shift_out , week_off } = req.body;

    const newShift = new Shift({
      
      shift_in: shift_in || "10:00", // Default shift_in if not provided
      shift_out: shift_out || "07:00", // Default shift_out if not provided
      week_off: week_off || "Sunday" // Default week_off if not provided

    });

    await newShift.save();

    res.status(201).json({ message: "Demo shift saved successfully", data: newShift });
  } catch (error) {
    console.error("Error saving demo shift:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

addAttendance.put("/updateShift/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { shift_in, shift_out, week_off } = req.body;
  
      // Find and update shift
      const updatedShift = await Shift.findByIdAndUpdate(
        id,
        {
          shift_in: shift_in || "10:00",
          shift_out: shift_out || "07:00",
          week_off: week_off || "Sunday",
        },
        { new: true } // Return updated document
      );
  
      if (!updatedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
  
      res.status(200).json({ message: "Shift updated successfully", data: updatedShift });
    } catch (error) {
      console.error("Error updating shift:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

addAttendance.get("/getShift", async (req, res) => {
    try {
      const shifts = await Shift.find({});
      res.status(200).json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

 
  addAttendance.post("/addAttendance", async (req, res) => {
    try {
      const { emp_id, date, time_in } = req.body;
  
      if (!emp_id || !date || !time_in) {
        return res.status(400).json({ message: "emp_id, date, and time_in are required" });
      }
  
      // Find the employee's shift
      const shift = await Shift.findOne();
      if (!shift) {
        return res.status(404).json({ message: "Shift data not found for employee" });
      }
  
      const timeInMinutes = convertToMinutes(time_in);
      const shiftInMinutes = convertToMinutes(shift.shift_in);
      const graceLimit = convertToMinutes("10:30"); // 10:30 AM grace limit
      const lateHalfDayLimit = convertToMinutes("10:10"); // Half-day if 6th late arrival and before 10:10 AM
      const fullDayAbsenceLimit = convertToMinutes("14:00"); // Mark absent if after 2:00 PM
  
      let status = "Present";
      let late_by = "N/A";
  
      if (timeInMinutes > shiftInMinutes) {
        late_by = formatMinutes(timeInMinutes - shiftInMinutes);
      }
  
      // Fetch employee's past attendance to track late arrivals
      const pastLateCount = await Attendance.countDocuments({
        emp_id,
        late_by: { $ne: "N/A" },
        date: { $regex: `^${date.substring(0, 7)}` } // Matches current month
      });
  
      if (timeInMinutes > shiftInMinutes) {
        if (pastLateCount >= 5) {
          if (timeInMinutes <= lateHalfDayLimit) {
            status = "Half-Day";
          } else if (timeInMinutes >= fullDayAbsenceLimit) {
            status = "Absent";
          } else {
            status = "Late";
          }
        } else if (timeInMinutes <= graceLimit) {
          status = "Present"; // Still within grace period
        } else {
          status = "Late";
        }
      }
  
      const newAttendance = new Attendance({
        emp_id,
        date,
        time_in,
        time_out: "N/A",
        total_work_duration: "N/A",
        late_by,
        early_out: "N/A",
        record_clock_in: true,
        record_clock_out: false,
        status
      });
  
      await newAttendance.save();
  
      res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  // Utility function to convert time (HH:mm) to minutes
function convertToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Utility function to format minutes as HH:mm
function formatMinutes(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

// API to add attendance (Clock In)
addAttendance.post("/addAttendance", async (req, res) => {
  try {
      const { emp_id, date, time_in } = req.body;

      if (!emp_id || !date || !time_in) {
          return res.status(400).json({ message: "emp_id, date, and time_in are required" });
      }

      // Find the employee's shift
      const shift = await Shift.findOne({ emp_id });
      if (!shift) {
          return res.status(404).json({ message: "Shift data not found for employee" });
      }

      const timeInMinutes = convertToMinutes(time_in);
      const shiftInMinutes = convertToMinutes(shift.shift_in);
      const graceLimit = convertToMinutes("10:30"); // 10:30 AM grace limit
      const lateHalfDayLimit = convertToMinutes("10:10"); // Half-day if 6th late arrival and before 10:10 AM
      const fullDayAbsenceLimit = convertToMinutes("14:00"); // Mark absent if after 2:00 PM

      let status = "Present";
      let late_by = "N/A";

      if (timeInMinutes > shiftInMinutes) {
          late_by = formatMinutes(timeInMinutes - shiftInMinutes);
      }

      // Fetch employee's past attendance to track late arrivals
      const pastLateCount = await Attendance.countDocuments({
          emp_id,
          late_by: { $ne: "N/A" },
          date: { $regex: `^${date.substring(0, 7)}` } // Matches current month
      });

      if (timeInMinutes > shiftInMinutes) {
          if (pastLateCount >= 5) {
              if (timeInMinutes <= lateHalfDayLimit) {
                  status = "Half-Day";
              } else if (timeInMinutes >= fullDayAbsenceLimit) {
                  status = "Absent";
              } else {
                  status = "Late";
              }
          } else if (timeInMinutes <= graceLimit) {
              status = "Present"; // Still within grace period
          } else {
              status = "Late";
          }
      }

      const newAttendance = new Attendance({
          emp_id,
          date,
          time_in,
          time_out: "N/A",
          total_work_duration: "N/A",
          late_by,
          early_out: "N/A",
          record_clock_in: true,
          record_clock_out: false,
          status
      });

      await newAttendance.save();

      res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
  } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API to update attendance (Clock Out)
addAttendance.put("/updateAttendance/:id", async (req, res) => {
  try {
      const { id } = req.params; // Object ID from URL
      const { emp_id, time_out } = req.body;

      if (!emp_id || !time_out) {
          return res.status(400).json({ message: "emp_id and time_out are required" });
      }

      // Find existing attendance record
      const attendance = await Attendance.findOne({ _id: id, emp_id });

      if (!attendance) {
          return res.status(404).json({ message: "Attendance record not found" });
      }

      // Find employee shift data
      const shift = await Shift.findOne({ emp_id });

      if (!shift) {
          return res.status(404).json({ message: "Shift data not found for employee" });
      }

      const timeInMinutes = convertToMinutes(attendance.time_in);
      const timeOutMinutes = convertToMinutes(time_out);
      const shiftOutMinutes = convertToMinutes(shift.shift_out);

      // Calculate total work duration
      const total_work_duration = formatMinutes(timeOutMinutes - timeInMinutes);

      // Calculate early out (if time_out is before shift_out)
      let early_out = "N/A";
      if (timeOutMinutes < shiftOutMinutes) {
          early_out = formatMinutes(shiftOutMinutes - timeOutMinutes);
      }

      // Determine status based on total work duration
      let status = attendance.status;

      if (timeOutMinutes - timeInMinutes < 240) {
          status = "Half-Day"; // Less than 4 hours worked
      }

      // Update the attendance record
      attendance.time_out = time_out;
      attendance.total_work_duration = total_work_duration;
      attendance.early_out = early_out;
      attendance.record_clock_out = true;
      attendance.status = status;

      await attendance.save();

      res.status(200).json({ message: "Attendance updated successfully", data: attendance });
  } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
  
  addAttendance.get("/getAttendance", async (req, res) => {
    try {
      const allAttendance = await Attendance.find({});
      res.status(200).json(allAttendance);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  addAttendance.get("/getSingleAttendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find by _id or emp_id
      const attendance = await Attendance.findOne({
        emp_id: id 
      });
  
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
  
      res.status(200).json(attendance);
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  addAttendance.get("/getAttendanceByDate", async (req, res) => {
    try {
        const { emp_id1, date } = req.query;

        // Check if emp_id and date are provided
       
        // Find attendance by emp_id and date
        const attendance = await Attendance.find({emp_id:emp_id1 });

        if (!attendance) {
            return res.status(404).json({ message: `No attendance found for emp_id: ${emp_id1} on date: ${date}` });
        }

        res.status(200).json({
            message: "Attendance record found",
            data: attendance
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

  
  
export default addAttendance;


