exports.addStudent = (req, res) => {
  const studentInfo = req?.body;
  try {
    res.send("student added!");
  } catch (error) {
    console.error("/addStudent Error:", error);
  }
};
