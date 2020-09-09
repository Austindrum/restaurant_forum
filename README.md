# 餐廳清單
建立餐廳清單

## 功能
- 註冊、登入、登出功能，分為前台、後台使用者
- 登入後台新增/修改/刪除餐廳資料
- 點選餐廳可看到餐廳詳細資訊(類別、地址、電話、...)
- 新增、修改、刪除餐廳資料
- 登入後台修改使用者權限

## 測試帳號
| 帳號  | 密碼 |
| ------------- | ------------- |
| root@example.com  | 12345678  |
| user1@example.com  | 12345678  |
| user2@example.com  | 12345678  |

## 安裝及設定
1. Clone 至本機環境
```bash
git clone https://github.com/Austindrum/restaurant_forum.git
```
2. 安裝 Dependencies & DB Setup
```bash
npm install
CREATE DATABASE forum
use forum
npx sequelize db:migrate
npx sequelize db:seed:all
```
3. 開發模式啟動
```bash
npm run dev
```
4. 環境變數
- SESSION_SECRET
- IMGUR_ID
## 開發人員
[Austin Liu](https://github.com/Austindrum)