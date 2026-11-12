# Smart Warranty – Product Warranty Tracking System

A frontend-only React prototype for tracking product warranties. All data lives in your browser's LocalStorage. There is no backend.

**Stack:** React 18, Vite, React Router, Recharts, Lucide React, plain CSS.

## Run on Windows 11 (VS Code + CMD/PowerShell)

1. Install Node.js 18 or newer from https://nodejs.org (LTS).
2. Extract the ZIP, then open the `smart-warranty` folder in VS Code.
3. Open the terminal (Ctrl + `) and run:

```bash
npm install
npm run dev
```

The app opens at http://localhost:5173 (if it does not, open that address yourself).

## Demo login

- Email: `demo@smartwarranty.com`
- Password: `demo123`
- Or click **Continue with demo account**.

## Live demonstration script

1. **Login** with the demo credentials.
2. **Dashboard**: show Total, Active, Expiring Soon and Expired cards and the charts.
3. **Add Product** (sidebar): click **Fill sample laptop** (HP, Pavilion 15, 12 months, Demo Electronics) or type the values. Optionally upload an invoice image/PDF and click Preview.
4. **Automatic calculation**: the Warranty summary panel shows the expiry date live. Click **Save product**.
5. **My Products**: the new laptop is highlighted. Try search, status filter and category filter.
6. **Warranty Tracking**: show the Active, Expiring Soon and Expired columns with progress bars.
7. **Notifications**: show products nearing expiry with days remaining. Mark one as read.
8. **Edit**: in My Products click the pencil on any product, change a value, save, and see the updated details page.

## Notes

- Demo records are generated relative to today's date, so their statuses always match the current date. Use **Reset demo data** (profile menu or Settings) to regenerate them.
- Expiring Soon means 30 days or fewer remain.
- Notifications are simulated in the app. No email or SMS is sent.
- Invoices are stored in LocalStorage as data URLs, so files are limited to 1.5 MB.

## Project structure

```
src/
  components/   shared UI (badges, modal, toasts, etc.)
  context/      app state + LocalStorage persistence
  data/         demo data generator
  layouts/      sidebar + top bar shell
  pages/        Login, Dashboard, Products, ProductForm, ProductDetails, Tracking, Notifications, Settings
  utils/        date and warranty calculations
```

Build for production: `npm run build` (output in `dist/`).
