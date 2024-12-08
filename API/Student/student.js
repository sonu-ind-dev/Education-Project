const { Op } = require("sequelize");
const sequelize = require("../../database/db");
const sendResponse = require("../../responseFormat");
const Student = require("../../models/student");
const StudentCredential = require("../../models/student_credential");

// Create Student Account & Save Credentials
exports.Signup = async (req, res) => {
  const process = await sequelize.transaction();
  try {
    const { student_name, student_password, student_username } = req.body;
    delete req.body.student_password;
    delete req.body.student_username;

    if (!student_name || !student_password || !student_username) {
      return sendResponse(
        res,
        false,
        "Signup failed. Missing required details."
      );
    }

    const duplicateStudentUsername = await StudentCredential.findOne({
      where: { student_username },
    });

    if (duplicateStudentUsername) {
      return sendResponse(
        res,
        false,
        "Signup failed. This username is already taken."
      );
    }

    const studentInfo = await Student.create(req.body, {
      transaction: process,
    });
    await StudentCredential.create(
      {
        student_id: studentInfo?.student_id,
        student_username,
        student_password,
      },
      { transaction: process }
    );

    await process.commit();
    sendResponse(
      res,
      true,
      "Student account has been created successfully.",
      studentInfo
    );
  } catch (error) {
    await process.rollback();
    console.error("Error while creating student account:", error);
    sendResponse(
      res,
      false,
      `Account creation failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Signin As Student
exports.Signin = async (req, res) => {
  try {
    const { student_username, student_password } = req.query;

    if (!student_username || !student_password) {
      return sendResponse(
        res,
        false,
        "Signin failed. Missing username or password."
      );
    }

    const { student_id } =
      (await StudentCredential.findOne({
        where: { student_username, student_password },
        attributes: ["student_id"],
      })) || {};

    if (!student_id) {
      return sendResponse(
        res,
        false,
        "No student found. Please check the provided values."
      );
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return sendResponse(
        res,
        false,
        "Student credential matched but student details not found."
      );
    }

    sendResponse(res, true, "Signin successful.", student);
  } catch (error) {
    console.error("Error during signin:", error);
    sendResponse(
      res,
      false,
      `Signin failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Edit Student Basic Information
exports.EditStudentProfile = async (req, res) => {
  try {
    const student_id = Number(req.params?.student_id);
    const updated_student_data = req.body;

    if (!student_id) {
      return sendResponse(
        res,
        false,
        "Edit student profile failed. Unable to get student ID."
      );
    }

    const [rowsUpdated] = await Student.update(updated_student_data, {
      where: { student_id },
    });
    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "Student profile update failed. No changes were made."
      );
    }

    sendResponse(res, true, "Student profile updated successfully.");
  } catch (error) {
    console.error("Error during editing student profile:", error);
    sendResponse(
      res,
      false,
      `Edit student profile failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};
