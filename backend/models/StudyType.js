import mongoose from "mongoose";

const studyTypeSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const StudyType = mongoose.model("StudyType", studyTypeSchema);

export default StudyType;
