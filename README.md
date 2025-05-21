# DGPA Date Checker

台灣人事行政總處假日資料查詢 API

## 功能說明

- 查詢今天是否為假日
- 查詢 2025 年特定日期是否為假日
- 回傳假日備註說明（如：春節、清明節等）

## 系統需求

- Google 帳號
- Google Spreadsheet（試算表）存放假日資料
- Google Apps Script 執行環境

## 設定步驟

1. 建立 Google Apps Script 專案
   - 前往 [Google Apps Script](https://script.google.com/)
   - 點擊「新專案」
   - 將 `src/Code.gs` 的程式碼複製到編輯器中

2. 設定試算表
   - 將假日資料匯入 Google Spreadsheet
   - 確保資料格式如下：
     ```
     西元日期    星期    是否放假    備註
     20250101    三      2          開國紀念日
     20250102    四      0
     ```
   - 取得試算表 ID（從網址中 `/d/` 之後的部分）

3. 設定 Script Properties
   - 在 Apps Script 編輯器中執行：
     ```javascript
     setConfig('你的試算表ID', 'Sheet1');
     ```
   - 其中 'Sheet1' 為工作表名稱，請依實際情況調整

4. 部署為網頁應用程式
   - 點擊「部署」>「新增部署」
   - 選擇「網頁應用程式」
   - 「執行身分」選擇「我」
   - 「誰可以存取」選擇「所有人」
   - 完成部署後會取得一個 URL

## API 使用說明

### 1. 查詢今天是否為假日

```
GET https://script.google.com/macros/s/.../exec
```

回傳範例：

```json
{
    "date": "20250101",
    "isHoliday": 2,
    "remark": "開國紀念日"
}
```

### 2. 查詢特定日期

```
GET https://script.google.com/macros/s/.../exec?date=20250101
```

回傳範例：

```json
{
    "date": "20250101",
    "isHoliday": 2,
    "remark": "開國紀念日"
}
```

### 回傳值說明

- `isHoliday`: 
  - `0`: 上班日
  - `2`: 放假日
- `remark`: 假日說明（如果有的話）
- `error`: 如果發生錯誤，會回傳錯誤訊息

### 錯誤範例

```json
{
    "error": "日期格式錯誤，請使用 YYYYMMDD 格式"
}
```

## 注意事項

1. 目前僅支援 2025 年的日期查詢
2. 日期格式必須為 YYYYMMDD（例：20250101）
3. 建議設定 API 呼叫頻率限制，避免過度使用

## 資料來源

資料來自[台灣政府資料開放平台](https://data.gov.tw/dataset/14718)

## 授權

MIT License
