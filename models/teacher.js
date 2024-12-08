// * teacher table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const Teacher = sequelize.define(
  "teacher",
  {
    teacher_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    teacher_name: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    teacher_dob: {
      type: DataTypes.DATE,
    },
    teacher_gender: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1, // ? 1: Male, 2: Female, 3: Other
    },
    teacher_address: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    teacher_address_pincode: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    teacher_email: {
      type: DataTypes.CHAR,
      unique: true,
      validate: {
        isEmail: true,
        len: [3, 50],
      },
    },
    teacher_phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    teacher_alternate_phone_number: {
      type: DataTypes.BIGINT,
    },
  },
  {
    tableName: "teacher",
    timestamps: true, // createdAt and updatedAt will be added automatically
  }
);

(async () => {
  try {
    await Teacher.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Teacher table:", error);
  }
})();

module.exports = Teacher;
