// * student table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const Student = sequelize.define(
  "student",
  {
    student_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    student_school_id: {
      type: DataTypes.BIGINT,
    },
    student_name: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    student_dob: {
      type: DataTypes.DATE,
    },
    student_gender: {
      type: DataTypes.BIGINT,
      defaultValue: 1, // ? 1: Male, 2: Female, 3: Other
    },
    student_class_id: {
      type: DataTypes.BIGINT,
    },
    student_profile_visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // ? false: Visible to parents, class teachers & school profiles, true: Visible to everyone
    },
  },
  {
    tableName: "student",
    timestamps: true, // createdAt and updatedAt will be added automatically
  }
);

(async () => {
  try {
    await Student.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Student table:", error);
  }
})();

module.exports = Student;
