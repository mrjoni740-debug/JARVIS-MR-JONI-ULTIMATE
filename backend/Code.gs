
const MODEL = "gemini-2.5-flash";

function doGet() {
  return jsonResponse({
    status: "success",
    message: "JARVIS MR. JONI Backend Ready",
    developer: "MR. JONI"
  });
}

function doPost(e) {
  try {
    const apiKey = PropertiesService
      .getScriptProperties()
      .getProperty("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("Gemini API key is not configured");
    }

    const data = JSON.parse(e.postData.contents);
    const message = String(data.message || "").trim();

    if (!message) {
      throw new Error("Message is empty");
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/"
      + MODEL + ":generateContent";

    const payload = {
      contents: [{
        parts: [{
          text: message
        }]
      }]
    };

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-goog-api-key": apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() >= 400) {
      throw new Error(
        result.error?.message || "Gemini API request failed"
      );
    }

    const answer =
      result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "No response received";

    return jsonResponse({
      status: "success",
      answer: answer
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      error: error.message
    });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
