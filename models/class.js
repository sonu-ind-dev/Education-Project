// * class table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const ClassModel = sequelize.define(
  "class",
  {
    class_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    class_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    class_index: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "class",
    timestamps: false,
  }
);

(async () => {
  try {
    await ClassModel.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the Class table:", error);
  }
})();

module.exports = ClassModel;
