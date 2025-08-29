exports.handler = async (event, context) => {
    const payload = JSON.parse(event.body).payload;
    // Custom logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Form submission handled" })
    };
  };
  