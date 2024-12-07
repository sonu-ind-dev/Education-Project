exports.signin = (req, res) => {
  try {
    console.log("signin");
    res.status(200).send({ data: "signin" });
  } catch (error) {
    console.log("error while signin");
  }
};
