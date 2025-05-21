// 從 Properties Service 取得設定值
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    SHEET_ID: scriptProperties.getProperty('SHEET_ID'),
    SHEET_NAME: scriptProperties.getProperty('SHEET_NAME') || 'Sheet1'
  };
}

// 設定 Properties（需要時才執行）
function setConfig(sheetId, sheetName = 'Sheet1') {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    'SHEET_ID': sheetId,
    'SHEET_NAME': sheetName
  });
}

/**
 * 將回應轉換為 JSON 格式
 * @param {Object} data - 要回傳的資料
 * @return {TextOutput} JSON 格式的回應
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 將日期格式化為 YYYYMMDD
 * @param {Date} date - 日期物件
 * @return {string} 格式化後的日期字串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 從 Sheet 讀取假日資料
 * @return {Object} 假日資料物件
 */
function getHolidayData() {
  // 取得設定值
  const config = getConfig();
  if (!config.SHEET_ID) {
    throw new Error('尚未設定 SHEET_ID，請先執行 setConfig()');
  }

  // 讀取試算表資料
  const sheet = SpreadsheetApp.openById(config.SHEET_ID).getSheetByName(config.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // 將資料轉換成物件格式
  const holidayMap = {};
  // 跳過標題列
  for (let i = 1; i < data.length; i++) {
    const [date, weekday, isHoliday, remark] = data[i];
    holidayMap[date] = {
      isHoliday: parseInt(isHoliday),  // 確保是數字
      remark: remark || ''
    };
  }
  
  return holidayMap;
}

/**
 * 檢查特定日期是否為假日
 * @param {string} dateString - YYYYMMDD 格式的日期字串
 * @return {Object} 檢查結果
 */
function checkDate(dateString) {
  const holidayData = getHolidayData();
  
  if (!holidayData[dateString]) {
    return {
      error: "日期資料不存在",
      date: dateString
    };
  }

  return {
    date: dateString,
    isHoliday: holidayData[dateString].isHoliday,
    remark: holidayData[dateString].remark
  };
}

/**
 * Web API 端點
 * @param {Object} e - 請求參數
 * @return {TextOutput} JSON 格式的回應
 */
function doGet(e) {
  try {
    // 如果沒有提供日期參數，檢查今天
    if (!e.parameter.date) {
      const today = new Date();
      const formattedDate = formatDate(today);
      return jsonResponse(checkDate(formattedDate));
    }

    // 檢查提供的日期
    const dateParam = e.parameter.date;
    
    // 驗證日期格式
    if (!/^\d{8}$/.test(dateParam)) {
      return jsonResponse({
        error: "日期格式錯誤，請使用 YYYYMMDD 格式"
      });
    }

    // 驗證年份是否為 2025
    if (!dateParam.startsWith('2025')) {
      return jsonResponse({
        error: "目前只支援 2025 年的日期查詢"
      });
    }

    return jsonResponse(checkDate(dateParam));

  } catch (error) {
    return jsonResponse({
      error: "發生錯誤：" + error.toString()
    });
  }
}
