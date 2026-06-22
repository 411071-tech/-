# Vocab Trainer (純前端)

簡單的純前端背單字工具，包含練習頁（index.html）與管理頁（manage.html）。

使用方式：

- 開啟 `index.html` 開始背單字。
- 開啟 `manage.html` 新增、編輯或刪除單字。管理頁有「自動填入」按鈕，會呼叫 Dictionary API 與 LibreTranslate 嘗試補全資料。

資料會儲存在瀏覽器的 `localStorage`（鍵名 `vocab_trainer_words`）。

注意：自動填入需要網路，且第三方 API 可能有使用限制或 CORS 限制。
# 簡易背單字工具

這是一個簡單的 Python 單字背誦工具，支援：

- 從 `vocab.csv` 讀取中文字對英文單字
- 隨機出題進行背誦
- 新增單字到字庫
- 列出目前字庫內容

## 使用方式

1. 先確認已安裝 Python 3
2. 執行測驗：

```bash
python vocab_trainer.py
```

3. 從英文測驗中文：

```bash
python vocab_trainer.py --reverse
```

4. 改變題數：

```bash
python vocab_trainer.py --count 20
```

5. 新增單字：

```bash
python vocab_trainer.py --add
```

6. 列出字庫：

```bash
python vocab_trainer.py --list
```

## 單字檔案

預設會使用 `vocab.csv`，格式為：

```
中文,英文
```

可以直接編輯 `vocab.csv` 或使用 `--add` 來新增單字。