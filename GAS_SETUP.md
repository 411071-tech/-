# 使用 Google Apps Script 將單字儲存到 Google 試算表 — 詳細步驟

本檔說明如何建立 Google 試算表 (Google Sheets) 與 Google Apps Script (GAS) Web App（doPost 接收 JSON），並示範如何在前端 `manage.js` 中設定 `GAS_ENDPOINT`，將管理頁新增的單字傳到試算表。

目標：當管理者在 `manage.html` 填寫單字並按下「儲存單字」後，前端會把該筆資料 POST 到 GAS，GAS 會把資料寫入 Google 試算表。

前置作業
- 你需要一個 Google 帳號與網路瀏覽器。

步驟 1：建立 Google 試算表
1. 開啟 Google Sheets（https://sheets.google.com），按「新增」建立一個空白試算表。
2. 將第一列設定為欄位標題（A1..E1）：
   - A1: word
   - B1: translation
   - C1: root
   - D1: example
   - E1: pos
3. 儲存並記下試算表的名稱。

步驟 2：建立 Apps Script 專案並撰寫後端程式碼
1. 在試算表中，點選「擴充功能」>「Apps Script」。這會開啟 GAS 編輯器，並自動把專案綁在該試算表上。
2. 在 Code.gs（或從空白專案新增）貼上以下程式碼：

```javascript
// 將收到的 JSON 寫入目前綁定的試算表（Sheets）
function doPost(e){
  try{
    // 解析 JSON 內容
    var data = JSON.parse(e.postData.contents);

    // 開啟活躍的試算表（若是綁定於試算表的專案，SpreadsheetApp.getActiveSpreadsheet() 可用）
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet(); // 或 ss.getSheetByName('Sheet1')

    // 準備要寫入的欄位順序：word, translation, root, example, pos
    var row = [
      data.word || '',
      data.translation || '',
      data.root || '',
      data.example || '',
      data.pos || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({status:'error',message:err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 儲存檔案（Ctrl/Cmd+S），並給專案一個名稱（例如：VocabReceiver）。

步驟 3：部署成 Web App（取得可供前端呼叫的 URL）
1. 在 Apps Script 編輯器中，點選「部署」>「新增部署」。
2. 選擇「Web 應用程式」。
3. 設定說明（例如：v1）。
4. 「執行應用程式的人」選擇 `我`（或根據你的需求）。
5. 「任何人（甚至匿名使用者）」可存取：若你想讓前端直接呼叫且不需要使用者登入，請選擇此項（注意：此選項會讓任何人都能呼叫此 API）。若你希望更安全，選擇適當的權限並改用授權流程。
6. 點選「部署」，系統會要求授權，允許必要的權限（存取你的試算表等）。
7. 部署完成後，你會得到一個 URL（類似 `https://script.google.com/macros/s/AKfycbx.../exec`），請複製此 URL。

步驟 4：設定 `manage.js` 中的 `GAS_ENDPOINT`
1. 在你的專案（本地）中開啟 `manage.js`。
2. 找到開頭的 `GAS_ENDPOINT` 常數，將剛剛複製的 Web App URL 貼入，例如：

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx.../exec'
```

3. 儲存並重新載入 `manage.html`。

步驟 5：測試流程
1. 啟動靜態伺服器或直接把檔案放至能被瀏覽器安全載入的位置。建議使用簡單的伺服器：
```bash
python3 -m http.server 8000
```
2. 開啟 `http://localhost:8000/manage.html`，輸入一筆測試單字並按「儲存」。
3. 若前端能成功 POST 並 GAS 回傳狀態，瀏覽器會顯示成功提示；同時在 Google Sheets 應該能看到新的一列資料。

疑難排解與注意事項
- CORS: Apps Script Web App 預設允許 POST，但若你遇到 CORS 問題，確保你部署時選擇了合適的授權範圍（例如允許任何人）。若需要更嚴格安全防護，可在 doPost 中檢查一個自訂的 API key 欄位。
- 權限: 第一次部署時會跳出授權畫面，請使用同一個 Google 帳號授權。
- 安全性: 對外開放 Web App 會讓任何人可以寫入試算表，若資料敏感請考慮加簽名或使用受限後端代理。
- 內容驗證: 在 doPost 中可加入資料驗證（例如檢查 `word` 欄位是否存在），並回傳錯誤訊息給前端。

進階：如果你想在新增後回傳該行的 ID 或其他資訊，可修改 GAS 回傳更詳細的 JSON，例如回傳 `rowNumber`。

範例：在 `doPost` 成功後回傳行號
```javascript
var lastRow = sheet.getLastRow();
return ContentService.createTextOutput(JSON.stringify({status:'ok',row:lastRow})).setMimeType(ContentService.MimeType.JSON);
```

結語
---
照著以上步驟，你可以快速將前端的單字管理頁面整合到 Google 試算表，方便在雲端保存與協作。如需我幫你把 `GAS_ENDPOINT` 直接填入 `manage.js`，或是把 GAS 程式碼部署為受限存取版本，我可以接著幫忙。 
