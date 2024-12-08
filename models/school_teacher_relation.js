// * school teacher relation table
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const SchoolTeacherRelation = sequelize.define(
  "school_teacher_relation",
  {
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    teacher_role: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    teacher_from_class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    teacher_to_class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    teacher_joining_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "school_teacher_relation",
    timestamps: false,
  }
);

(async () => {
  try {
    await SchoolTeacherRelation.sync({ alter: false }); // Use alter to update the table structure in the database
  } catch (error) {
    console.error("Error syncing the School Teacher Relation table:", error);
  }
})();

module.exports = SchoolTeacherRelation;
