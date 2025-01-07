// create, edit, delete oa
// approve oa
// reject oa
// negotiate oa time

import OA from "../models/oa.js";
import Student from "../models/user_model/student.js";
import moment from 'moment';

 export const checkShortlistStatus = async (req, res) => {
  const { userId, job_id } = req.params;
  try {
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentRollNo = student.rollno;
    const oa = await OA.findOne({ job_id });
    if (!oa) {
      return res.status(404).json({ message: 'OA not found' });
    }
    const { shortlisted_students } = oa;
    if (shortlisted_students.length === 0) {
      return res.status(200).json({ message: 'Yet to be decided' });
    }
    const isShortlisted = shortlisted_students.some(
      (student) => student.rollno === studentRollNo
    );
    if (isShortlisted) {
      return res.status(200).json({ message: 'Shortlisted', oa });
    }
    return res.status(200).json({ message: 'Not shortlisted' });
  } catch (error) {
    console.error('Error checking shortlist status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
 

export const getTodayShortlistsGroupedByCompany = async (req, res) => {
    try {
      const startOfDay = moment().startOf('day');
      const endOfDay = moment().endOf('day');
      const oas = await OA.find({
        $expr: {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$result_date" } },
                new Date(startOfDay.toISOString())
              ]
            },
            {
              $lte: [
                { $dateFromString: { dateString: "$result_date" } },
                new Date(endOfDay.toISOString())
              ]
            }
          ]
        }
      });
  
      if (oas.length === 0) {
        return res.status(200).json({ 
          message: 'No oas with results today',
          data: [] 
        });
      }
  
      const result = oas.map((oa) => ({
        company_name: oa.company_name,
        company_logo: oa.company_logo,
        shortlisted_students: oa.shortlisted_students?.map((student) => ({
          name: student.name,
          email: student.email,
          rollno: student.rollno,
        })) || [],
      }));
  
      return res.status(200).json({
        message: 'Today\'s shortlisted students grouped by company',
        data: result,
      });
  
    } catch (error) {
      console.error('Error fetching today\'s shortlists:', error);
      console.error('Error details:', error.stack);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  };

export const getOADetails = async (req, res) => {
    const { jobId} = req.params;
    try {
      const oa = await OA.findOne({ 
        job_id: jobId,  
      });
      if (!oa) {
        return res.status(404).json({ message: 'OA not found' });
      }
      return res.status(200).json({ 
        message: 'OA details retrieved successfully',
        oa
      });
    } catch (error) {
      console.error('Error fetching oa details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



/*   export const getEligibleUpcomingOAs = async (req, res) => {
    try {
      const userId = req.params.userId;
      const student = await Student.findById(userId);
      if (!student) {
        throw new Error("Student not found");
      }
      const userRollNo = student.rollno;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const oas = await OA.find({
        $expr: {
          $gte: [
            { $dateFromString: { dateString: "$test_date" } },
            currentDate
          ]
        },
        "eligible_students.rollno": userRollNo
      });
      return res.status(200).json({ oas });
    } catch (error) {
      console.error("Error fetching eligible upcoming OAs:", error);
      throw error;
    }
  }; */

  export const getEligibleUpcomingOAs = async (req, res) => {
    try {
      const studentId = req.user.userId; // Assuming `req.user` contains the authenticated user's details
      console.log("Student ID:", studentId);
      // Fetch jobs where the student is eligible and the hiring workflow contains an OA step
      const jobsWithOAs = await JobProfile.find({
        Current_Eligible_Students: studentId,
        "Hiring_Workflow.step_type": "OA",
      })
        .select(
          "company_name company_logo Hiring_Workflow.job_type Hiring_Workflow.details"
        )
        .lean();
  
      // Extract relevant OA details for each job
      const upcomingOAs = jobsWithOAs.flatMap((job) => {
        return job.Hiring_Workflow.filter(
          (step) => step.step_type === "OA" && new Date(step.details.oa_date) > new Date()
        ).map((step) => ({
          company_name: job.company_name,
          company_logo: job.company_logo,
          oa_date: step.details.oa_date,
          oa_login_time: step.details.oa_login_time,
          oa_duration: step.details.oa_duration,
          oa_info: step.details.oa_info,
          oa_link: step.details.oa_link,
        }));
      });
  
      if (upcomingOAs.length === 0) {
        return res.status(404).json({ message: "No upcoming OAs found for the student." });
      }
  
      res.status(200).json({ upcomingOAs });
    } catch (error) {
      console.error("Error fetching upcoming OAs:", error);
      res.status(500).json({ message: "Server error while fetching upcoming OAs." });
    }
  };
  
  

export const getEligiblePastOAs = async (req,res) => {
    try {
      const userId = req.params.userId;
      const student = await Student.findById(userId);
      if (!student) {
        throw new Error('Student not found');
      }
      const userRollNo = student.rollno;
      const currentDate = moment().startOf('day');
      const oas = await OA.find({
        $expr: {
          $lt: [
            { $dateFromString: { dateString: "$test_date" } },
            new Date(currentDate.toISOString())
          ]
        },
        "eligible_students.rollno": userRollNo
      });
      return res.status(200).json({ oas });
    } catch (error) {
      console.error("Error fetching eligible past OAs: ", error);
      throw error;
    }
  };





