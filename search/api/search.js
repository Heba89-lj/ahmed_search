
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { number, year } = req.query;

  if (!number || !year) {
    return res.status(400).json({ success: false, message: "ادخلي رقم الفحص والسنة" });
  }

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    console.log("🔗 Requesting URL:", url);

    const response = await fetch(url);

    // نقرأ النص أول مرة
    const rawText = await response.text();

    // نحاول نحوله JSON لو نقدر
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("❌ Google API returned non-JSON:", rawText);
      return res.status(500).json({
        success: false,
        message: "رد غير صالح من Google Sheets",
        details: rawText,
      });
    }

    // لو Google رجعت خطأ واضح
    if (!response.ok || data.error) {
      console.error("❌ Google Sheets API error:", data.error || rawText);
      return res.status(500).json({
        success: false,
        message: "خطأ في الوصول إلى Google Sheet",
        details: data.error?.message || rawText,
      });
    }

    const rows = data.values?.slice(1) || [];


   const match = rows.find((r) => 
  r[0]?.toString().trim() === number.toString().trim() && 
  r[1]?.toString().trim() === year.toString().trim()
);


    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[0],
          year: match[1],
          caseNumber: match[2],
          applicant: match[3],
          status: match[4],
          visa: match[5],
          notes: match[6],
        },
      });
    } else {
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات لهذا الفحص" });
    }
  } catch (error) {
    console.error("🔥 Error fetching Google Sheet:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في السيرفر",
      error: error.message,
    });
  }
}



// export default async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const { number, year, nationalId } = req.query;

//   if (!number || !year || !nationalId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "ادخلي رقم الفحص والسنة والرقم القومي" });
//   }

//   // ✅ تحويل الأرقام العربية إلى إنجليزية
//   const normalize = (str = "") =>
//     str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).trim();

//   const num = normalize(number);
//   const yr = normalize(year);
//   const nid = normalize(nationalId);

//   const sheetId = process.env.SHEET_ID;
//   const apiKey = process.env.GOOGLE_API_KEY;

//   try {
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
//     const response = await fetch(url);
//     const rawText = await response.text();

//     let data;
//     try {
//       data = JSON.parse(rawText);
//     } catch {
//       return res.status(500).json({
//         success: false,
//         message: "رد غير صالح من Google Sheets",
//       });
//     }

//     if (!response.ok || data.error) {
//       return res.status(500).json({
//         success: false,
//         message: "خطأ في الوصول إلى Google Sheet",
//       });
//     }

//     const rows = data.values?.slice(1) || [];

//    // ✅ البحث في نفس الصف عن رقم الفحص والسنة والرقم القومي
// const match = rows.find(
//   (r) =>
//     normalize(r[0]) === num && // رقم الفحص
//     normalize(r[1]) === yr && // السنة
//     normalize(r[2]).includes(nid) // الرقم القومي (حتى لو أكتر من رقم في الخلية)
// );


//     if (match) {
//       return res.status(200).json({
//         success: true,
//         result: {
//           number: match[0],
//           year: match[1],
//           // ❌ حذف الرقم القومي من النتيجة
//           caseNumber: match[3],
//           applicant: match[4],
//           status: match[5],
//           visa: match[6],
//           notes: match[7],
//         },
//       });
//     } else {
//       return res
//         .status(404)
//         .json({ success: false, message: "لم يتم العثور على بيانات مطابقة" });
//     }
//   } catch (error) {
//     console.error("🔥 Error fetching Google Sheet:", error);
//     return res.status(500).json({
//       success: false,
//       message: "حدث خطأ في السيرفر",
//       error: error.message,
//     });
//   }
// }

