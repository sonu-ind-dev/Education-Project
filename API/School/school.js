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

    // ! STEP 3: Update the school profile and get updated profile data
    const [rowsUpdated] = await School.update(updated_school_data, {
      where: { school_id },
    });

    // ! STEP 4: Show error if no row effected
    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "School profile update failed. No changes were made!"
      );
    }

    // ! STEP 5: Send success response
    return sendResponse(res, true, "School profile updated successfully.");
  } catch (error) {
    // ! STEP 6: Error handling
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

    // ! STEP 3: Check for duplicate class (optional)
    const isDuplicateClassExist = await ClassModel.findOne({
      where: { school_id, class_number, class_section },
    });
    if (isDuplicateClassExist) {
      return sendResponse(
        res,
        false,
        "Another class with the same number and section already exists for this school!"
      );
    }

    // ! STEP 4: Create the new class
    const numberOfSections = await ClassModel.count({
      where: { school_id, class_number },
    });

    const createdClass = await ClassModel.create({
      school_id,
      class_number,
      class_section,
      class_section_index: numberOfSections + 1,
    });

    // ! STEP 5: Verify if class creation was successful
    if (!createdClass) {
      return sendResponse(
        res,
        false,
        "Failed to add class in school. Please try again!"
      );
    }

    // ! STEP 6: Send success response
    return sendResponse(
      res,
      true,
      "Class in the school added successfully.",
      createdClass
    );
  } catch (error) {
    // ! STEP 7: Handle errors
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

// ? Changing Class Number Of School
exports.ChangeClassNumber = async (req, res) => {
  try {
    const { school_id, class_id } = req?.params;
    const { new_class_number } = req?.query;

    // ! STEP 1: Validate input details
    if (!school_id || !class_id || !new_class_number) {
      return sendResponse(
        res,
        false,
        "Failed to update class number. Reason: Missing required details!"
      );
    }

    // ! STEP 2: Check if a class with the same number and section already exists
    const isDuplicateClassExist = await ClassModel.findOne({
      where: {
        school_id,
        class_number: new_class_number,
        class_section: req?.Class?.class_section,
      },
    });

    if (isDuplicateClassExist) {
      return sendResponse(
        res,
        false,
        "Failed to update class number. Reason: A class with the same number and section already exists in this school!"
      );
    }

    // ! STEP 3: Update the class number
    const [rowsUpdated] = await ClassModel.update(
      { class_number: new_class_number },
      { where: { class_id, school_id } }
    );

    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "Failed to update class number. Reason: No changes were made!"
      );
    }

    // ! STEP 4: Return success response
    return sendResponse(res, true, "Class number updated successfully.");
  } catch (error) {
    // ! STEP 5: Handle errors
    console.error("Error during class number update:", error);
    return sendResponse(
      res,
      false,
      `Failed to update class number. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// ? Add Section In Class Of A School
exports.AddClassSection = async (req, res) => {
  try {
    // ! STEP 1: Extract parameters and body data
    const { school_id, class_id } = req.params;
    const { class_section } = req.body;

    // ! STEP 2: Validate the input data
    if (!school_id || !class_id || !class_section) {
      return sendResponse(
        res,
        false,
        "Failed to add the section. Reason: Missing required details (school_id, class_id, or class_section)!"
      );
    }

    // ! STEP 3: Check if the section already exists for this class
    const isDuplicateClassExist = await ClassModel.findOne({
      where: {
        school_id,
        class_number: req?.Class?.class_number,
        class_section,
      },
    });

    if (isDuplicateClassExist) {
      return sendResponse(
        res,
        false,
        "Another class with the same number and section already exists for this school!"
      );
    }

    // ! STEP 4: Create a new section
    const numberOfSections = await ClassModel.count({
      where: { school_id, class_number: req?.Class?.class_number },
    });

    const newSection = await ClassModel.create({
      school_id,
      class_number: req?.Class?.class_number,
      class_section,
      class_section_index: numberOfSections + 1,
    });

    // ! STEP 5: Send a success response with the created section details
    return sendResponse(
      res,
      true,
      "Section successfully added to the class.",
      newSection
    );
  } catch (error) {
    // ! STEP 6: Handle and log unexpected errors
    console.error("Error while adding a section to the class:", error);
    return sendResponse(
      res,
      false,
      `An error occurred while adding the section. Reason: ${error.message}`,
      {}
    );
  }
};

exports.RenameClassSection = async (req, res) => {
  try {
    // ! STEP 1: Extract parameters and query data
    const { school_id, class_id } = req?.params;
    const { new_class_section } = req?.query;

    // ! STEP 2: Validate the input data
    if (!school_id || !class_id || !new_class_section) {
      return sendResponse(
        res,
        false,
        "Failed to add the section. Reason: Missing required details (school_id, class_id, or class_section)!"
      );
    }

    // ! STEP 3: Check if a class with the same number and section already exists
    const duplicateClass = await ClassModel.findOne({
      where: {
        school_id,
        class_number: req?.Class?.class_number,
        class_section: new_class_section,
      },
    });

    if (duplicateClass) {
      return sendResponse(
        res,
        false,
        "Failed to update class section. Reason: A class with the same number and section already exists in this school!"
      );
    }

    // ! STEP 4: Update the class number
    const [rowsUpdated] = await ClassModel.update(
      { class_section: new_class_section },
      { where: { class_id, school_id } }
    );

    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "Failed to update class section. Reason: No changes were made!"
      );
    }

    // ! STEP 5: Return success response
    return sendResponse(res, true, "Class section updated successfully.");
  } catch (error) {
    // ! STEP 6: Handle and log unexpected errors
    console.error("Error while renaming the section:", error);
    return sendResponse(
      res,
      false,
      `An error occurred while renaming the section. Reason: ${error.message}`,
      {}
    );
  }
};
