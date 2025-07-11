import College from "../models/College.js";
import Branch from "../models/Branch.js";
import StudyType from "../models/StudyType.js";

export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find({}).sort({ label: 1 });
    // Add "Other (Specify)" option manually
    const collegesWithOptions = [
      ...colleges,
      { value: "custom", label: "Other (Specify)" },
    ];
    res.json(collegesWithOptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching colleges", error });
  }
};

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({}).sort({ label: 1 });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branches", error });
  }
};

export const getStudyTypes = async (req, res) => {
  try {
    const studyTypes = await StudyType.find({}).sort({ label: 1 });
    res.json(studyTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching study types", error });
  }
};
