# Moderated Chat Overlay (ZIP-ready)

簡介：一個簡單的匿名留言 + 管理員審核 → Overlay 顯示的範例。適合放在 Streamlabs 的 Browser Source。

使用說明：
1. 安裝依賴：`npm install`
2. 設定 admin token（可選）：`export ADMIN_TOKEN="my_secret_admin_token"`
3. 啟動：`npm start`
4. 打開：
   - 觀眾頁： `http://localhost:3000/`
   - 管理頁（帶 token）： `http://localhost:3000/admin.html?token=my_secret_admin_token`
   - Overlay（放入 Streamlabs Browser Source）： `http://localhost:3000/overlay.html`

注意：
- 目前使用記憶體儲存（重啟會清除）。請在生產環境使用資料庫（例如 SQLite / Postgres）。
- 不要把 ADMIN_TOKEN 推上公開 Repo。部署時使用環境變數。
