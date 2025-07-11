import Questions from "../models/Questions.js";
import ReportedQuestion from "../models/ReportedQuestions.js";

export const reportQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    // First check if the question exists
    const question = await Questions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find or create reported question document
    let reportedQuestion = await ReportedQuestion.findOne({ question: id });

    if (!reportedQuestion) {
      reportedQuestion = new ReportedQuestion({
        question: id,
        reportedBy: [],
      });
    }

    // Check if user has already reported this question
    const existingReport = reportedQuestion.reportedBy.find(
      (report) => report.userId.toString() === userId,
    );

    if (existingReport) {
      return res
        .status(400)
        .json({ message: "You have already reported this question" });
    }

    // Add new report
    reportedQuestion.reportedBy.push({
      userId,
      reason,
      description,
      reportedAt: new Date(),
    });

    await reportedQuestion.save();

    res.status(200).json({
      message: "Question reported successfully",
      report:
        reportedQuestion.reportedBy[reportedQuestion.reportedBy.length - 1],
    });
  } catch (error) {
    console.error("Error reporting question:", error);
    res.status(500).json({
      message: "Error reporting question",
      error: error.message,
    });
  }
};

export const getReportedQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ReportedQuestion.countDocuments({
      "reportedBy.0": { $exists: true },
    });

    const reportedQuestions = await ReportedQuestion.find({
      "reportedBy.0": { $exists: true },
    })
      .populate({
        path: "question",
        populate: {
          path: "postedBy",
          select: "displayName collegeName role _id",
        },
      })
      .populate("reportedBy.userId", "displayName collegeName role _id")
      .sort({ "reportedBy.reportedAt": -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      reportedQuestions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching reported questions:", error);
    res.status(500).json({
      message: "Error fetching reported questions",
      error: error.message,
    });
  }
};

export const removeReport = async (req, res) => {
  try {
    const { id, reportId } = req.params;
    const userId = req.user.id;

    const reportedQuestion = await ReportedQuestion.findOne({ question: id });

    if (!reportedQuestion) {
      return res.status(404).json({ message: "Reported question not found" });
    }

    // Find and remove the specific report
    const reportIndex = reportedQuestion.reportedBy.findIndex(
      (report) => report._id.toString() === reportId,
    );

    if (reportIndex === -1) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user is authorized to remove this report
    if (reportedQuestion.reportedBy[reportIndex].userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove this report" });
    }

    reportedQuestion.reportedBy.splice(reportIndex, 1);

    // If no reports left, delete the entire document
    if (reportedQuestion.reportedBy.length === 0) {
      await reportedQuestion.deleteOne();
    } else {
      await reportedQuestion.save();
    }

    res.json({ message: "Report removed successfully" });
  } catch (error) {
    console.error("Error removing report:", error);
    res.status(500).json({
      message: "Error removing report",
      error: error.message,
    });
  }
};
