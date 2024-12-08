const { Op } = require("sequelize");
const sequelize = require("../../database/db");
const School = require("../../models/school");
const SchoolCredential = require("../../models/school_credential");
const sendResponse = require("../../responseFormat");
const ClassModel = require("../../models/class");
const ClassSection = require("../../models/class_section");
const SchoolTeacherRelation = require("../../models/school_teacher_relation");

// Create School Account & Save Credentials
exports.Signup = async (req, res) => {
  const process = await sequelize.transaction();
  try {
    const {
      school_email,
      school_password,
      school_website_url,
      school_phone_number,
    } = req.body;
    delete req.body.school_password;

    if (
      !school_email ||
      !school_phone_number ||
      !school_website_url ||
      !school_password
    ) {
      return sendResponse(
        res,
        false,
        "Signin failed. Missing required details."
      );
    }

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
      const errorMessage =
        duplicateEntry.school_email === school_email
          ? `The email '${school_email}' is already registered.`
          : duplicateEntry.school_phone_number === school_phone_number
          ? `The phone number '${school_phone_number}' is already registered.`
          : `The website URL '${school_website_url}' is already registered.`;

      return sendResponse(res, false, errorMessage);
    }

    const schoolInfo = await School.create(req.body, { transaction: process });
    await SchoolCredential.create(
      {
        school_id: schoolInfo.school_id,
        school_phone_number,
        school_password,
      },
      { transaction: process }
    );

    await process.commit();
    sendResponse(
      res,
      true,
      "School account has been created successfully.",
      schoolInfo
    );
  } catch (error) {
    await process.rollback();
    console.error("Error while creating school account:", error);
    sendResponse(
      res,
      false,
      `Account creation failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Signin As School
exports.Signin = async (req, res) => {
  try {
    const { school_phone_number, school_password } = req.query;

    if (!school_phone_number || !school_password) {
      return sendResponse(
        res,
        false,
        "Signin failed. Missing phone number or password."
      );
    }

    const { school_id } =
      (await SchoolCredential.findOne({
        where: { school_phone_number, school_password },
        attributes: ["school_id"],
      })) || {};

    if (!school_id) {
      return sendResponse(
        res,
        false,
        "No school found. Please check the provided values."
      );
    }

    const school = await School.findByPk(school_id);
    if (!school) {
      return sendResponse(
        res,
        false,
        "School credential matched but school details not found."
      );
    }

    sendResponse(res, true, "Signin successful.", school);
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

// Edit School Basic Information
exports.EditSchoolProfile = async (req, res) => {
  try {
    const { school_id } = req.params;
    const updated_school_data = req.body;

    if (!school_id || !updated_school_data) {
      return sendResponse(
        res,
        false,
        "Edit school profile failed. Missing required details."
      );
    }

    const [rowsUpdated] = await School.update(updated_school_data, {
      where: { school_id },
    });
    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "School profile update failed. No changes were made."
      );
    }

    sendResponse(res, true, "School profile updated successfully.");
  } catch (error) {
    console.error("Error during editing school profile:", error);
    sendResponse(
      res,
      false,
      `Edit school profile failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Add Class In School
exports.AddClass = async (req, res) => {
  const process = await sequelize.transaction();
  try {
    const { school_id } = req?.params;
    const class_number = Number(req?.query?.class_number);

    if (!school_id || !class_number) {
      return sendResponse(
        res,
        false,
        "Class addition failed. Missing required details."
      );
    }

    const isDuplicateClassExist = await ClassModel.findOne({
      where: { school_id, class_number },
    });
    if (isDuplicateClassExist) {
      return sendResponse(
        res,
        false,
        "Class with this number already exists for the school."
      );
    }

    const numberOfClasses = await ClassModel.count({ where: { school_id } });
    const createdClass = await ClassModel.create(
      {
        school_id,
        class_number,
        class_index: numberOfClasses + 1,
      },
      { transaction: process }
    );

    const class_id = createdClass.class_id;
    await ClassSection.destroy({ where: { class_id } });

    const createdSection = await ClassSection.create(
      { class_id },
      { transaction: process }
    );
    if (!createdSection) {
      await process.rollback();
      return sendResponse(
        res,
        false,
        "Failed to add default section in the class."
      );
    }

    await process.commit();
    sendResponse(res, true, "Class added successfully.", {
      createdClass,
      createdSection,
    });
  } catch (error) {
    await process.rollback();
    console.error("Error during adding class:", error);
    sendResponse(
      res,
      false,
      `Adding class failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Changing Class Number Of School
exports.ChangeClassNumber = async (req, res) => {
  try {
    const { school_id, class_id } = req.params;
    const { old_class_number, new_class_number } = req.query;

    if (!school_id || !class_id || !new_class_number) {
      return sendResponse(
        res,
        false,
        "Failed to update class number. Missing required details."
      );
    }

    const isOldClassNumberExists = await ClassModel.findOne({
      where: { class_id, class_number: old_class_number },
    });
    if (!isOldClassNumberExists) {
      return sendResponse(res, false, "No class exists to change the number.");
    }

    const isDuplicateClassExist = await ClassModel.findOne({
      where: { school_id, class_number: new_class_number },
    });
    if (isDuplicateClassExist) {
      return sendResponse(res, false, "Class with this number already exists.");
    }

    const [rowsUpdated] = await ClassModel.update(
      { class_number: new_class_number },
      { where: { class_id, school_id } }
    );
    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "Failed to update class number. No changes were made."
      );
    }

    sendResponse(res, true, "Class number updated successfully.");
  } catch (error) {
    console.error("Error during class number update:", error);
    sendResponse(
      res,
      false,
      `Failed to update class number. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Add Section In Class Of A School
exports.AddClassSection = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { class_section } = req.query;

    if (!class_id || !class_section) {
      return sendResponse(
        res,
        false,
        "Failed to add section. Missing required details."
      );
    }

    const isDuplicateClassSectionExist = await ClassSection.findOne({
      where: { class_id, class_section },
    });

    if (isDuplicateClassSectionExist) {
      return sendResponse(
        res,
        false,
        "Section with this name already exists in the class."
      );
    }

    const numberOfSections = await ClassSection.count({ where: { class_id } });
    const newSection = await ClassSection.create({
      class_id,
      class_section,
      class_section_index: numberOfSections + 1,
    });

    sendResponse(res, true, "Section added successfully.", newSection);
  } catch (error) {
    console.error("Error while adding section:", error);
    sendResponse(
      res,
      false,
      `Failed to add section. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Rename Class Section
exports.RenameClassSection = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { old_class_section, new_class_section } = req.query;

    if (!class_id || !new_class_section) {
      return sendResponse(
        res,
        false,
        "Failed to rename section. Missing required details."
      );
    }

    const isOldScenarioExist = await ClassSection.findOne({
      where: { class_id, class_section: old_class_section },
    });

    if (!isOldScenarioExist) {
      return sendResponse(res, false, "No section exists to rename.");
    }

    const isDuplicateClassSectionExist = await ClassSection.findOne({
      where: { class_id, class_section: new_class_section },
    });

    if (isDuplicateClassSectionExist) {
      return sendResponse(res, false, "Section with this name already exists.");
    }

    const [rowsUpdated] = await ClassSection.update(
      { class_section: new_class_section },
      { where: { class_id, class_section: old_class_section } }
    );

    if (rowsUpdated === 0) {
      return sendResponse(
        res,
        false,
        "Failed to rename section. No changes were made."
      );
    }

    sendResponse(res, true, "Section renamed successfully.");
  } catch (error) {
    console.error("Error while renaming section:", error);
    sendResponse(
      res,
      false,
      `Failed to rename section. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Add Teacher In School
exports.AddTeacherIntoSchool = async (req, res) => {
  try {
    const { school_id, teacher_id } = req.params;
    const { teacher_role, teacher_from_class_id, teacher_to_class_id } =
      req.body;

    req.body.school_id = school_id;
    req.body.teacher_id = teacher_id;

    if (!teacher_role || !teacher_from_class_id || !teacher_to_class_id) {
      return sendResponse(
        res,
        false,
        "Add teacher failed. Missing required details."
      );
    }

    const isClassesExists = await ClassModel.count({
      where: {
        [Op.or]: [
          { class_id: teacher_from_class_id },
          { class_id: teacher_to_class_id },
        ],
      },
    });

    if (isClassesExists !== 2) {
      return sendResponse(
        res,
        false,
        `Class not found with the provided class ids`
      );
    }

    const isSchoolTeacherNotConnected = await SchoolTeacherRelation.count({
      where: { school_id, teacher_id },
    });

    if (isSchoolTeacherNotConnected) {
      return sendResponse(res, false, `This teacher is already added.`);
    }

    const school_teacher_relation = await SchoolTeacherRelation.create(
      req.body
    );

    return sendResponse(
      res,
      true,
      `Teacher added successfully.`,
      school_teacher_relation
    );
  } catch (error) {
    console.error("Error while adding teacher:", error);
    sendResponse(
      res,
      false,
      `Failed to add teacher. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Remove Teacher From School
exports.RemoveTeacherFromSchool = async (req, res) => {
  try {
    const { school_id, teacher_id } = req.params;

    if (!school_id || !teacher_id) {
      return sendResponse(
        res,
        false,
        "Add teacher failed. Missing required details."
      );
    }

    const isSchoolTeacherNotConnected = await SchoolTeacherRelation.count({
      where: { school_id, teacher_id },
    });

    if (!isSchoolTeacherNotConnected) {
      return sendResponse(
        res,
        false,
        `Teacher is already not present in school staff.`
      );
    }

    const school_teacher_relation = await SchoolTeacherRelation.create(
      req.body
    );

    return sendResponse(
      res,
      true,
      `Teacher removed successfully.`,
      school_teacher_relation
    );
  } catch (error) {
    console.error("Error while removing teacher:", error);
    sendResponse(
      res,
      false,
      `Failed to remove teacher. Reason: ${error.message}`,
      {},
      error
    );
  }
};
