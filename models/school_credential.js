// ! school_credential table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const SchoolCredential = sequelize.define(
  "school_credential",
  {
    school_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
      unique: true,
      comment: "Primary key for the school_credential table",
    },
    school_phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    school_password: {
      type: DataTypes.CHAR,
      allowNull: false,
      validate: {
        len: [5, 25], // Length between 5 and 100 characters
      },
    },
  },
  {
    tableName: "school_credential",
    timestamps: false, // createdAt and updatedAt will be added automatically
  }
);

(async () => {
  try {
    await SchoolCredential.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the School Credential table:", error);
  }
})();

module.exports = SchoolCredential;
