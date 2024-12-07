const { Op } = require("sequelize");
const sequelize = require("../../database/db"); // Assuming sequelize instance is exported here
const School = require("../../models/school");
const SchoolCredential = require("../../models/school_credential");
const sendResponse = require("../../responseFormat");

exports.signin = async (req, res) => {
  const t = await sequelize.transaction(); // Start a transaction
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
    const schoolInfo = await School.create(req?.body, { transaction: t });

    await SchoolCredential.create(
      {
        school_id: schoolInfo?.school_id,
        school_phone_number,
        school_password,
      },
      { transaction: t }
    );

    // Commit transaction if all operations succeed
    await t.commit();

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
    await t.rollback();

    console.error("Error while creating school account:", error);

    // Send error response
    sendResponse(
      res,
      false,
      `Account creation failed. Reason: ${error?.message}`,
      {},
      error
    );
  }
};
