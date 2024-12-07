const { Op } = require("sequelize");
const sequelize = require("../../database/db"); // Assuming sequelize instance is exported here
const School = require("../../models/school");
const SchoolCredential = require("../../models/school_credential");
const sendResponse = require("../../responseFormat");
const ClassModel = require("../../models/class");

// ? Create School Account & Save Credentials
exports.Signup = async (req, res) => {
  const process = await sequelize.transaction(); // Start a transaction
  try {
    const {
      school_email,
      school_password,
      school_website_url,
      school_phone_number,
    } = req?.body;

    delete req?.body?.school_password;

    // ! STEP 1: Validate if email, phone number, or website URL is already in use
    const duplicateEntry = await School.findOne({
      where: {
        [Op.or]: [
          { school_email },
          { school_phone_number },
          { school_website_url },
        ],
      },
    });

    if (duplicateEntry) {
      let errorMessage = "";

      if (duplicateEntry.school_email === school_email) {
        errorMessage = `The email '${school_email}' is already registered. Please try another email.`;
      } else if (duplicateEntry.school_phone_number === school_phone_number) {
        errorMessage = `The phone number '${school_phone_number}' is already registered. Please try another phone number.`;
      } else if (duplicateEntry.school_website_url === school_website_url) {
        errorMessage = `The website URL '${school_website_url}' is already registered. Please try another URL.`;
      }

      return sendResponse(res, false, errorMessage);
    }

    // ! STEP 2: Create School account and School credential
    const schoolInfo = await School.create(req?.body, { transaction: process });

    await SchoolCredential.create(
      {
        school_id: schoolInfo?.school_id,
        school_phone_number,
        school_password,
      },
      { transaction: process }
    );

    // Commit transaction if all operations succeed
    await process.commit();

    // ! STEP 3: Send response for successful account creation
    sendResponse(
      res,
      true,
      "School account has been created successfully.",
      schoolInfo
    );
  } catch (error) {
    // ! STEP 4: Error Handling
    // Rollback transaction on error
    await process.rollback();

    console.error("Error while creating school account:", error);

    // Send error response
    sendResponse(
      res,
      false,
      `Account creation failed. Reason: ${error?.message}!`,
      {},
      error
    );
  }
};

// ? Signin As School
exports.Signin = async (req, res) => {
  try {
    const { school_phone_number, school_password } = req.query;

    // ! STEP 1: Validate input
    if (!school_phone_number || !school_password) {
      return sendResponse(
        res,
        false,
        "Signin failed. Reason: Missing phone number or password."
      );
    }

    // ! STEP 2: Fetch school_id based on user input
    const { school_id } = await SchoolCredential.findOne({
      where: { school_phone_number, school_password },
      attributes: ["school_id"],
    });

    if (!school_id) {
      return sendResponse(
        res,
        false,
        "No school found. Please check the provided values and try again!"
      );
    }

    // ! STEP 3: Fetch school details using school_id
    const school = await School.findByPk(school_id);

    if (!school) {
      return sendResponse(
        res,
        false,
        "School credential matched but school details not found!"
      );
    }

    // ! STEP 4: Successful Signin
    return sendResponse(res, true, "Signin successful.", school);
  } catch (error) {
    // ! STEP 5: Error handling
    console.error("Error during signin:", error);
    return sendResponse(
      res,
      false,
      `Signin failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// ? Edit School Basic Information
exports.EditSchoolProfile = async (req, res) => {
  try {
    // ! STEP 1: Extract required data from request
    const { school_id } = req?.params;
    const updated_school_data = req?.body;

    // ! STEP 2: Validate input
    if (!school_id || !updated_school_data) {
      return sendResponse(
        res,
        false,
        "Edit school profile failed. Reason: Missing required details!"
      );
    }

    // ! STEP 3: Check if the school exists
    const school = await School.findByPk(school_id);

    if (!school) {
      return sendResponse(
        res,
        false,
        "No school found. Please check the provided school ID and try again!"
      );
    }

    // ! STEP 4: Update the school profile and get updated profile data
    const [rowsUpdated, updated_school_profile_data] = await School.update(
      updated_school_data,
      {
        where: { school_id },
        returning: true,
      }
    );

    // ! STEP 5: Show error if no row effected
    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "School profile update failed. No changes were made!"
      );
    }

    // ! STEP 6: Send success response
    return sendResponse(
      res,
      true,
      "School profile updated successfully.",
      updated_school_profile_data
    );
  } catch (error) {
    // ! STEP 7: Error handling
    console.error("Error during editing school profile:", error);
    return sendResponse(
      res,
      false,
      `Edit school profile failed. Reason: ${error.message}!`,
      {},
      error
    );
  }
};

// ? Add Class In School
exports.AddClass = async (req, res) => {
  try {
    // ! STEP 1: Extract parameters and body data
    const { school_id } = req.params;
    const { class_number, class_section } = req.body;

    // ! STEP 2: Validate required details
    if (!school_id || !class_number || !class_section) {
      return sendResponse(
        res,
        false,
        "Class addition in the school failed. Reason: Missing required details!"
      );
    }

    // ! STEP 3: Verify if the school exists
    const school = await School.findByPk(school_id);
    if (!school) {
      return sendResponse(
        res,
        false,
        "No school found. Please check the provided school ID and try again!"
      );
    }

    // ! STEP 4: Check for duplicate class (optional)
    const existingClass = await ClassModel.findOne({
      where: { school_id, class_number, class_section },
    });
    if (existingClass) {
      return sendResponse(
        res,
        false,
        "Class with the same number and section already exists for this school!"
      );
    }

    // ! STEP 5: Create the new class
    const createdClass = await ClassModel.create({
      school_id,
      class_number,
      class_section,
    });

    // ! STEP 6: Verify if class creation was successful
    if (!createdClass) {
      return sendResponse(
        res,
        false,
        "Failed to add class in school. Please try again!"
      );
    }

    // ! STEP 7: Send success response
    return sendResponse(
      res,
      true,
      "Class in the school added successfully.",
      createdClass
    );
  } catch (error) {
    // ! STEP 8: Handle errors
    console.error("Error during adding class in school:", error);
    return sendResponse(
      res,
      false,
      `Adding class in school failed. Reason: ${error.message}!`,
      {},
      error
    );
  }
};

// ? Add Section In Class Of A School
exports.AddSection = async (req, res) => {
  try {
    // ! STEP 1: Extract parameters and body data
    const { school_id, class_id } = req.params;
    const { class_section } = req.body;

    // ! STEP 2: Validate the input data
    if (!school_id || !class_id || !class_section) {
      return sendResponse(
        res,
        false,
        "Failed to add the section. Reason: Missing required details (school ID, class ID, or section)!"
      );
    }

    // ! STEP 3: Check if the school exists
    const school = await School.findByPk(school_id);
    if (!school) {
      return sendResponse(
        res,
        false,
        "Failed to add the section. Reason: No school found with the provided school ID!"
      );
    }

    // ! STEP 4: Check if the class exists in the school
    const existingClass = await ClassModel.findOne({
      where: { class_id, school_id },
    });
    if (!existingClass) {
      return sendResponse(
        res,
        false,
        "Failed to add the section. Reason: No class found with the provided class ID in the specified school!"
      );
    }

    // ! STEP 5: Check if the section already exists for this class
    const isSectionExist = await ClassModel.findOne({
      where: {
        school_id,
        class_number: existingClass.class_number,
        class_section,
      },
    });

    if (isSectionExist) {
      return sendResponse(
        res,
        false,
        "A class with the same number and section already exists for this school!"
      );
    }

    // ! STEP 6: Create a new section
    const newSection = await ClassModel.create({
      school_id,
      class_number: existingClass.class_number,
      class_section,
    });

    // ! STEP 7: Send a success response with the created section details
    return sendResponse(
      res,
      true,
      "Section successfully added to the class.",
      newSection
    );
  } catch (error) {
    // ! STEP 8: Handle and log unexpected errors
    console.error("Error while adding a section to the class:", error);
    return sendResponse(
      res,
      false,
      `An error occurred while adding the section. Reason: ${error.message}`,
      {}
    );
  }
};
