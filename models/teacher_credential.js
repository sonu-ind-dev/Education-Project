// * teacher credential table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const TeacherCredential = sequelize.define(
  "teacher_credential",
  {
    teacher_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    teacher_phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    teacher_password: {
      type: DataTypes.CHAR,
      allowNull: false,
      validate: {
        len: [5, 25], // Length between 5 and 25 characters
      },
    },
  },
  {
    tableName: "teacher_credential",
    timestamps: false,
  }
);

(async () => {
  try {
    await TeacherCredential.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Teacher Credential table:", error);
  }
})();

module.exports = TeacherCredential;
