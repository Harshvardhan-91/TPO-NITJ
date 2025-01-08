import Placement from '../models/placement.js'; // Adjust the path as needed
import moment from 'moment'; // For date handling

// // Get placements added today
export const getTodayPlacements = async (req, res) => {
  try {
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const todayPlacements = await Placement.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json(todayPlacements);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all placements
export const getAllPlacements = async (req, res) => {
  try {
    const allPlacements = await Placement.find().sort({ createdAt: -1 });
    res.json(allPlacements);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getFilteredPlacements = async (req, res) => {
  try {
    const {
      company_name,
      student_name,
      placement_type,
      year,
      degree,
      gender,
      department,
      ctc, 
    } = req.query;

    console.log(req);
    
    // Build dynamic filters for placements
    const filters = {};
    if (company_name) filters.company_name = { $regex: company_name, $options: "i" };   
    if (placement_type) filters.placement_type = placement_type;
    if (year) filters.year = year;
    if (degree) filters.degree = degree;



    // Handling CTC filtering based on ranges
    if (ctc) {
      if (ctc === "one") {
        console.log(heello);
        
        filters.ctc = { $lt: 1000000 }; // Less than 10 LPA (1 LPA = 100000)
      } else if (ctc === "two") {
        filters.ctc = { $gte: 1000000, $lt: 2000000 }; // Between 10 and 20 LPA (10 LPA = 1000000)
      } else if (ctc === "three") {
        filters.ctc = { $gte: 2000000 }; // Greater than 20 LPA (20 LPA = 2000000)
      }
    }

    console.log(filters);
    
    // Query the database for placements matching filters
    const placements = await Placement.find(filters);

    // Further filter shortlisted students based on gender and department
    const filteredPlacements = placements.map((placement) => {
      const filteredStudents = placement.shortlisted_students.filter((student) => {
        const matchesGender = !gender || student.gender.toLowerCase() === gender.toLowerCase();
        const matchesDepartment =
          !department || student.department.toLowerCase() === department.toLowerCase();
        return matchesGender && matchesDepartment;
      });

      return { ...placement.toObject(), shortlisted_students: filteredStudents };
    });

    // Remove placements without any shortlisted students after filtering
    const finalPlacements = filteredPlacements.filter(
      (placement) => placement.shortlisted_students.length > 0
    );

    // Return the filtered placements
    res.status(200).json(finalPlacements);
  } catch (error) {
    console.error("Error fetching placements:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const getFilteredPlacements = async (req, res) => {
//   try {
//     const {
//       company_name,
//       student_name,
//       placement_type,
//       year,
//       degree,
//       gender,
//       department,
//       ctc, 
//     } = req.query;

//     // Build dynamic filters for placements
//     const filters = {};
//     if (company_name) filters.company_name = { $regex: company_name, $options: "i" };   
//     if (placement_type) filters.placement_type = placement_type;
//     if (year) filters.year = year;
//     if (degree) filters.degree = degree;


//     if (ctc) {
//       if (ctc === "one") {
//         filters.ctc = { $lt: 10 }; // Less than 10 LPA
//       } else if (ctc === "two") {
//         filters.ctc = { $gte: 10, $lte: 20 }; // Between 10 and 20 LPA
//       } else if (ctc === "three") {
//         filters.ctc = { $gt: 20 }; // Greater than 20 LPA
//       }
//     }

//     // Query the database for placements matching filters
//     const placements = await Placement.find(filters);

//     // Further filter shortlisted students based on gender and department
//     const filteredPlacements = placements.map((placement) => {
//       const filteredStudents = placement.shortlisted_students.filter((student) => {
//         const matchesGender = !gender || student.gender.toLowerCase() === gender.toLowerCase();
//         const matchesDepartment =
//           !department || student.department.toLowerCase() === department.toLowerCase();
//         return matchesGender && matchesDepartment;
//       });

//       return { ...placement.toObject(), shortlisted_students: filteredStudents };
//     });

//     // Remove placements without any shortlisted students after filtering
//     const finalPlacements = filteredPlacements.filter(
//       (placement) => placement.shortlisted_students.length > 0
//     );

//     // Return the filtered placements
//     res.status(200).json(finalPlacements);
//   } catch (error) {
//     console.error("Error fetching placements:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


export const getLastSevenDaysPlacements = async(req,res) => {
  try {
    const startOfLastSevenDays = moment().subtract(7, "days").startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    const placements = await Placement.find({
      createdAt: { $gte: startOfLastSevenDays, $lte: endOfToday },
    });

    res.status(200).json(placements);
  } catch (error) {
    console.error("Error fetching placements from the last seven days:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};