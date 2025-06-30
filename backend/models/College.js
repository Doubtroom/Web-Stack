import mongoose from 'mongoose'

const collegeSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
        unique: true
    },
    label: {
        type: String,
        required: true
    }
});

const College = mongoose.model('College', collegeSchema);

export default College; 