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