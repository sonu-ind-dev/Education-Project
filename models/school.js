// * school table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const School = sequelize.define(
  "school",
  {
    school_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      comment: "Primary key for the school table",
    },
    school_name: {
      type: DataTypes.CHAR,
      allowNull: false,
      validate: {
        len: [5, 100], // Length between 5 and 100 characters
      },
    },
    school_address: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    school_address_pincode: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    school_board: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    school_email: {
      type: DataTypes.CHAR,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [3, 50],
      },
    },
    school_phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    school_alternate_phone_number: {
      type: DataTypes.BIGINT,
    },
    school_website_url: {
      type: DataTypes.CHAR,
      unique: true,
    },
  },
  {
    tableName: "school",
    timestamps: true, // createdAt and updatedAt will be added automatically
  }
);

(async () => {
  try {
    await School.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the School table:", error);
  }
})();

module.exports = School;
