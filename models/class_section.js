// * class section table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const ClassSection = sequelize.define(
  "class_section",
  {
    class_section_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    class_section: {
      type: DataTypes.CHAR,
      allowNull: false,
      defaultValue: "A",
    },
    class_section_index: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "class_section",
    timestamps: false,
  }
);

(async () => {
  try {
    await ClassSection.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Class Section table:", error);
  }
})();

module.exports = ClassSection;
