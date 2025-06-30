import mongoose from 'mongoose'


const branchSchema = new mongoose.Schema({
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

const Branch = mongoose.model('Branch', branchSchema);

export default Branch; 