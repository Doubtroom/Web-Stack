import CustomerCare from '../models/CustomerCare.js';

export const createCustomerCare = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user.id;

        if (!subject || !message) {
            return res.status(400).json({ 
                message: 'Subject and message are required' 
            });
        }

        const customerCare = await CustomerCare.create({
            subject,
            message,
            postedBy: userId
        });

        const populatedCustomerCare = await CustomerCare.findById(customerCare._id)
            .populate('postedBy', 'displayName collegeName role _id');

        res.status(201).json({
            message: 'Customer care request submitted successfully',
            customerCare: populatedCustomerCare
        });

    } catch (error) {
        console.error('Error creating customer care request:', error);
        res.status(500).json({ 
            message: 'Error creating customer care request', 
            error: error.message 
        });
    }
};

export const getCustomerCareRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await CustomerCare.countDocuments();

        const customerCareRequests = await CustomerCare.find()
            .populate('postedBy', 'displayName collegeName role _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            customerCareRequests,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error fetching customer care requests:', error);
        res.status(500).json({ 
            message: 'Error fetching customer care requests', 
            error: error.message 
        });
    }
};

export const getUserCustomerCareRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await CustomerCare.countDocuments({ postedBy: userId });

        const customerCareRequests = await CustomerCare.find({ postedBy: userId })
            .populate('postedBy', 'displayName collegeName role _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            customerCareRequests,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error fetching user customer care requests:', error);
        res.status(500).json({ 
            message: 'Error fetching user customer care requests', 
            error: error.message 
        });
    }
}; 