// * student credential table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const StudentCredential = sequelize.define(
  "student_credential",
  {
    student_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
      unique: true,
    },
    student_username: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    student_password: {
      type: DataTypes.CHAR,
      allowNull: false,
      validate: {
        len: [5, 25], // Length between 5 and 25 characters
      },
    },
  },
  {
    tableName: "student_credential",
    timestamps: false, // createdAt and updatedAt will be added automatically
  }
);

(async () => {
  try {
    await StudentCredential.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Student Credential table:", error);
  }
})();

module.exports = StudentCredential;
